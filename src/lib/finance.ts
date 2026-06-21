import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
export type AccountSubType = 'Bank' | 'Cash' | 'Receivable' | 'Payable' | 'Fixed Asset' | 'Current Liability' | 'Direct Expense' | 'Indirect Expense' | 'Sales' | 'Other Revenue' | 'Capital' | 'Drawings' | 'Tax Payable';

export interface Account {
  _id?: ObjectId;
  name: string;
  type: AccountType;
  subType: AccountSubType;
  currency: 'INR' | 'USD';
  description?: string;
  isSystem?: boolean; // System accounts cannot be deleted (e.g. Accounts Receivable)
  autoDepreciate?: boolean; // FLAG: User requested "automated depreciation engine for Fixed Assets, mark it"
  depreciationRate?: number; // Annual rate
  createdAt: Date;
  updatedAt: Date;
}

export interface LedgerEntry {
  _id?: ObjectId;
  transactionId: string; // Groups debit/credit pairs
  accountId: ObjectId | string;
  type: 'Debit' | 'Credit';
  amount: number;
  currency: 'INR' | 'USD';
  exchangeRate?: number; // E.g., if currency is USD and base is INR
  date: Date;
  description: string;
  referenceId?: string; // e.g. Invoice ID or Expense ID
  referenceType?: 'Invoice' | 'Expense' | 'Payment' | 'Manual' | 'Depreciation';
  reconciled?: boolean;
  reconciledAt?: Date;
  createdAt: Date;
}

export const FinanceDB = {
  async getAccounts() {
    const db = await getDatabase();
    return db.collection<Account>('accounts').find({}).toArray();
  },

  async createAccount(account: Omit<Account, 'createdAt' | 'updatedAt'>) {
    const db = await getDatabase();
    const newAccount = {
      ...account,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection<Account>('accounts').insertOne(newAccount);
    return { ...newAccount, _id: result.insertedId };
  },

  async getAccountByName(name: string) {
    const db = await getDatabase();
    return db.collection<Account>('accounts').findOne({ name });
  },

  /**
   * Helper to ensure basic system accounts exist (lazy init).
   */
  async ensureSystemAccounts() {
    const db = await getDatabase();
    const systemAccounts: Omit<Account, 'createdAt' | 'updatedAt'>[] = [
      { name: 'Cash in Hand', type: 'Asset', subType: 'Cash', currency: 'INR', isSystem: true },
      { name: 'Accounts Receivable', type: 'Asset', subType: 'Receivable', currency: 'INR', isSystem: true },
      { name: 'Accounts Payable', type: 'Liability', subType: 'Payable', currency: 'INR', isSystem: true },
      { name: 'Sales Revenue', type: 'Revenue', subType: 'Sales', currency: 'INR', isSystem: true },
      { name: 'Accumulated Depreciation', type: 'Asset', subType: 'Fixed Asset', currency: 'INR', isSystem: true } // Contra asset
    ];

    for (const acc of systemAccounts) {
      const exists = await db.collection<Account>('accounts').findOne({ name: acc.name, isSystem: true });
      if (!exists) {
        await this.createAccount(acc);
      }
    }
  },

  /**
   * Create a balanced Journal Entry (sum of Debits == sum of Credits)
   */
  async createJournalEntry(entries: Omit<LedgerEntry, 'createdAt' | 'transactionId'>[]) {
    // Validate balance
    const totalDebit = entries.filter(e => e.type === 'Debit').reduce((sum, e) => sum + e.amount, 0);
    const totalCredit = entries.filter(e => e.type === 'Credit').reduce((sum, e) => sum + e.amount, 0);
    
    // Using a tiny epsilon for float comparison
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`Journal entry unbalanced. Debits: ${totalDebit}, Credits: ${totalCredit}`);
    }

    const db = await getDatabase();
    const transactionId = new ObjectId().toString();
    const now = new Date();

    const ledgerEntries: LedgerEntry[] = entries.map(e => ({
      ...e,
      transactionId,
      accountId: typeof e.accountId === 'string' ? new ObjectId(e.accountId) : e.accountId,
      createdAt: now
    }));

    await db.collection<LedgerEntry>('ledger_entries').insertMany(ledgerEntries);
    return transactionId;
  },

  async getLedgerEntries(filters: any = {}) {
    const db = await getDatabase();
    return db.collection<LedgerEntry>('ledger_entries').find(filters).sort({ date: -1, createdAt: -1 }).toArray();
  },

  /**
   * Calculate Trial Balance or balance of specific accounts
   */
  async getAccountBalances() {
    const db = await getDatabase();
    
    // Aggregate ledger_entries grouping by accountId
    // Debits increase Assets/Expenses, Credits increase Liabilities/Equity/Revenue
    const balances = await db.collection('ledger_entries').aggregate([
      {
        $group: {
          _id: "$accountId",
          totalDebit: {
            $sum: { $cond: [{ $eq: ["$type", "Debit"] }, "$amount", 0] }
          },
          totalCredit: {
            $sum: { $cond: [{ $eq: ["$type", "Credit"] }, "$amount", 0] }
          }
        }
      }
    ]).toArray();

    return balances;
  },

  /**
   * Generate Profit & Loss Statement
   */
  async getProfitAndLoss(startDate?: Date, endDate?: Date) {
    const db = await getDatabase();
    
    // Build match query for date range
    const matchQuery: any = {};
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = startDate;
      if (endDate) matchQuery.date.$lte = endDate;
    }

    // Pipeline: 
    // 1. Filter by date
    // 2. Lookup account details to get AccountType
    // 3. Match only Revenue and Expense accounts
    const pipeline = [
      ...(Object.keys(matchQuery).length > 0 ? [{ $match: matchQuery }] : []),
      {
        $lookup: {
          from: 'accounts',
          let: { accId: { $toObjectId: "$accountId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$accId"] } } }
          ],
          as: 'accountDetails'
        }
      },
      { $unwind: "$accountDetails" },
      { $match: { "accountDetails.type": { $in: ["Revenue", "Expense"] } } },
      {
        $group: {
          _id: { accountId: "$accountId", name: "$accountDetails.name", type: "$accountDetails.type" },
          totalDebit: { $sum: { $cond: [{ $eq: ["$type", "Debit"] }, "$amount", 0] } },
          totalCredit: { $sum: { $cond: [{ $eq: ["$type", "Credit"] }, "$amount", 0] } }
        }
      }
    ];

    const results = await db.collection('ledger_entries').aggregate(pipeline).toArray();

    let totalRevenue = 0;
    let totalExpense = 0;
    const revenueAccounts: any[] = [];
    const expenseAccounts: any[] = [];

    results.forEach(res => {
      // Revenue normal balance is Credit
      if (res._id.type === 'Revenue') {
        const net = res.totalCredit - res.totalDebit;
        totalRevenue += net;
        revenueAccounts.push({ name: res._id.name, balance: net });
      } 
      // Expense normal balance is Debit
      else if (res._id.type === 'Expense') {
        const net = res.totalDebit - res.totalCredit;
        totalExpense += net;
        expenseAccounts.push({ name: res._id.name, balance: net });
      }
    });

    return {
      revenueAccounts,
      expenseAccounts,
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense
    };
  },

  /**
   * Generate Balance Sheet
   */
  async getBalanceSheet(asOfDate?: Date) {
    const db = await getDatabase();
    
    // Build match query for date (up to asOfDate)
    const matchQuery: any = {};
    if (asOfDate) {
      matchQuery.date = { $lte: asOfDate };
    }

    const pipeline = [
      ...(Object.keys(matchQuery).length > 0 ? [{ $match: matchQuery }] : []),
      {
        $lookup: {
          from: 'accounts',
          let: { accId: { $toObjectId: "$accountId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$accId"] } } }
          ],
          as: 'accountDetails'
        }
      },
      { $unwind: "$accountDetails" },
      { $match: { "accountDetails.type": { $in: ["Asset", "Liability", "Equity"] } } },
      {
        $group: {
          _id: { accountId: "$accountId", name: "$accountDetails.name", type: "$accountDetails.type" },
          totalDebit: { $sum: { $cond: [{ $eq: ["$type", "Debit"] }, "$amount", 0] } },
          totalCredit: { $sum: { $cond: [{ $eq: ["$type", "Credit"] }, "$amount", 0] } }
        }
      }
    ];

    const results = await db.collection('ledger_entries').aggregate(pipeline).toArray();

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    const assets: any[] = [];
    const liabilities: any[] = [];
    const equity: any[] = [];

    results.forEach(res => {
      if (res._id.type === 'Asset') {
        const net = res.totalDebit - res.totalCredit;
        totalAssets += net;
        assets.push({ name: res._id.name, balance: net });
      } else if (res._id.type === 'Liability') {
        const net = res.totalCredit - res.totalDebit;
        totalLiabilities += net;
        liabilities.push({ name: res._id.name, balance: net });
      } else if (res._id.type === 'Equity') {
        const net = res.totalCredit - res.totalDebit;
        totalEquity += net;
        equity.push({ name: res._id.name, balance: net });
      }
    });

    // Also get Net Profit up to this point and add it to Retained Earnings (Equity)
    const pl = await this.getProfitAndLoss(undefined, asOfDate);
    const retainedEarnings = pl.netProfit;
    
    totalEquity += retainedEarnings;
    equity.push({ name: 'Retained Earnings (Net Profit)', balance: retainedEarnings });

    return {
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity
    };
  }
};
