import { NextResponse } from 'next/server';
import { FinanceDB } from '@/lib/finance';
import { getDatabase } from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

async function getReplysysRevenue() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) return 0;
    
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('replysys-new');
    
    // We get all completed/success payments for total historical revenue
    const payments = await db.collection('payments').find({
      $or: [
        { status: 'completed' },
        { paymentStatus: 'success' }
      ]
    }).toArray();
    
    await client.close();

    const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    return totalRevenue;
  } catch (error) {
    console.error('Error fetching replysys revenue:', error);
    return 0;
  }
}

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Get all accounts and their current balances
    const balances = await FinanceDB.getAccountBalances();
    const accounts = await FinanceDB.getAccounts();

    // Map balances to account types
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalRevenue = 0;
    let totalExpenses = 0;

    let bankBalance = 0;
    let cashBalance = 0;
    let accountsReceivable = 0;
    let accountsPayable = 0;

    for (const bal of balances) {
      const account = accounts.find(a => a._id?.toString() === bal._id.toString());
      if (!account) continue;

      // Normal balance logic:
      // Assets & Expenses increase with Debits, decrease with Credits
      // Liabilities, Equity, Revenue increase with Credits, decrease with Debits
      
      const balance = (bal.totalDebit || 0) - (bal.totalCredit || 0); // Positive if Debit > Credit

      if (account.type === 'Asset') {
        const value = balance; // Normal balance is debit
        totalAssets += value;
        if (account.subType === 'Bank') bankBalance += value;
        if (account.subType === 'Cash') cashBalance += value;
        if (account.subType === 'Receivable') accountsReceivable += value;
      } 
      else if (account.type === 'Liability') {
        const value = -balance; // Normal balance is credit
        totalLiabilities += value;
        if (account.subType === 'Payable') accountsPayable += value;
      }
      else if (account.type === 'Expense') {
        totalExpenses += balance; // Normal balance is debit
      }
      else if (account.type === 'Revenue') {
        totalRevenue += -balance; // Normal balance is credit
      }
    }

    const workingCapital = totalAssets - totalLiabilities; // Current Assets - Current Liabilities (Simplified)
    const replysysRevenue = await getReplysysRevenue();
    const projectRevenue = totalRevenue; // Revenue from the main ledger (pixels CRM)
    const combinedTotalRevenue = totalRevenue + replysysRevenue;
    const netProfit = combinedTotalRevenue - totalExpenses;
    
    // Burn Rate (Simplified: average expenses per month over the last 30 days, or just total expenses if testing)
    const burnRate = totalExpenses; // Just using total for now
    
    // Runway: (Bank + Cash) / Burn Rate (in months)
    const runwayMonths = burnRate > 0 ? (bankBalance + cashBalance) / burnRate : 0;

    // Check if opening balance is set
    const openingBalanceEntry = await db.collection('ledger_entries').findOne({
      referenceType: 'Manual',
      description: /Opening Balance/i
    });

    return NextResponse.json({
      workingCapital,
      bankBalance,
      cashBalance,
      accountsReceivable,
      accountsPayable,
      totalRevenue: combinedTotalRevenue,
      projectRevenue,
      replysysRevenue,
      totalExpenses,
      netProfit,
      burnRate,
      runwayMonths: runwayMonths.toFixed(1),
      hasOpeningBalance: !!openingBalanceEntry
    });
  } catch (error) {
    console.error('Error fetching dashboard finance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
