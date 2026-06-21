import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { MongoClient } from 'mongodb';
import { FinanceDB } from '@/lib/finance';

async function getReplysysRevenue(startDate: Date, endDate: Date) {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) return 0;
    
    // Connect explicitly to the replysys-new database using a short-lived client, 
    // or we can reuse the connection. We'll make a fresh one for safety if we can't easily switch db.
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('replysys-new');
    
    // In replysys-new, revenue is tracked in `payments` collection
    // where status === 'completed' or paymentStatus === 'success'
    const payments = await db.collection('payments').find({
      createdAt: { $gte: startDate, $lte: endDate },
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
    return 0; // Return 0 if there's an error so the rest of P&L doesn't crash
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly'; // weekly, monthly, quarterly, annual
    
    const db = await getDatabase();
    
    // Calculate date ranges based on period
    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'quarterly') {
      startDate.setMonth(now.getMonth() - 3);
    } else if (period === 'annual') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate.setMonth(now.getMonth() - 1); // default to monthly
    }

    // 1. Fetch Double Entry Ledger Data
    const accounts = await FinanceDB.getAccounts();
    const ledgerEntries = await FinanceDB.getLedgerEntries({
      date: { $gte: startDate, $lte: now }
    });

    let totalIncome = 0;
    let totalExpense = 0;
    
    const incomeBreakdown: Record<string, number> = {};
    const expenseBreakdown: Record<string, number> = {};

    ledgerEntries.forEach(entry => {
      const account = accounts.find(a => a._id?.toString() === entry.accountId.toString());
      if (!account) return;

      const amount = entry.amount || 0;
      const category = account.name || 'Other';

      if (account.type === 'Revenue') {
        // Normal balance for Revenue is Credit. If it's a Credit, it increases revenue.
        if (entry.type === 'Credit') {
          totalIncome += amount;
          incomeBreakdown[category] = (incomeBreakdown[category] || 0) + amount;
        } else {
          totalIncome -= amount;
          incomeBreakdown[category] = (incomeBreakdown[category] || 0) - amount;
        }
      } else if (account.type === 'Expense') {
        // Normal balance for Expense is Debit. If it's a Debit, it increases expense.
        if (entry.type === 'Debit') {
          totalExpense += amount;
          expenseBreakdown[category] = (expenseBreakdown[category] || 0) + amount;
        } else {
          totalExpense -= amount;
          expenseBreakdown[category] = (expenseBreakdown[category] || 0) - amount;
        }
      }
    });

    // 2. Fetch Replysys Revenue
    const replysysRevenue = await getReplysysRevenue(startDate, now);
    
    // Add Replysys to the total income
    if (replysysRevenue > 0) {
      totalIncome += replysysRevenue;
      incomeBreakdown['replysys_revenue'] = replysysRevenue;
    }

    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    return NextResponse.json({
      period,
      startDate,
      endDate: now,
      totalIncome,
      totalExpense,
      netProfit,
      profitMargin,
      incomeBreakdown,
      expenseBreakdown
    });

  } catch (error) {
    console.error('Error calculating P&L:', error);
    return NextResponse.json(
      { error: 'Failed to calculate Profit & Loss' },
      { status: 500 }
    );
  }
}
