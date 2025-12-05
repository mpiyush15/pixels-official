import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();

    // Get all cash flow transactions
    const cashFlowTransactions = await db.collection('cashflow').find({}).toArray();
    
    let cashBalance = 0;
    let bankBalance = 0;
    
    const cashTransactions: any[] = [];
    const bankTransactions: any[] = [];

    cashFlowTransactions.forEach(txn => {
      const amount = txn.amount || 0;
      const record = {
        reference: txn.reference,
        type: txn.type,
        amount: amount,
        date: txn.transactionDate,
      };

      if (txn.accountType === 'cash') {
        cashBalance += txn.type === 'income' ? amount : -amount;
        cashTransactions.push(record);
      } else if (txn.accountType === 'bank') {
        bankBalance += txn.type === 'income' ? amount : -amount;
        bankTransactions.push(record);
      }
    });

    const totalBalance = cashBalance + bankBalance;

    // Get revenue, expenses, salaries for comparison
    const paidInvoices = await db.collection('invoices').find({ status: 'paid' }).toArray();
    const partiallyPaidInvoices = await db.collection('invoices').find({ status: 'partially_paid' }).toArray();
    const expenses = await db.collection('expenses').find({ paymentStatus: 'paid' }).toArray();
    const salaries = await db.collection('salaries').find({ status: 'paid' }).toArray();

    const fullyPaidRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const partialRevenue = partiallyPaidInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const totalRevenue = fullyPaidRevenue + partialRevenue;
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalSalaries = salaries.reduce((sum, sal) => sum + (sal.netAmount || 0), 0);
    const netProfit = totalRevenue - totalExpenses - totalSalaries;

    return NextResponse.json({
      success: true,
      cashFlow: {
        cashBalance,
        bankBalance,
        totalBalance,
        cashTransactionCount: cashTransactions.length,
        bankTransactionCount: bankTransactions.length,
        cashTransactions: cashTransactions.slice(0, 5), // Show first 5
        bankTransactions: bankTransactions.slice(0, 5), // Show first 5
      },
      businessMetrics: {
        totalRevenue,
        totalExpenses,
        totalSalaries,
        netProfit,
      },
      comparison: {
        message: 'Total Balance should be Cash + Bank balance from actual transactions',
        expectedTotalBalance: cashBalance + bankBalance,
        notTheFormula: 'It is NOT profit + expenses or any other calculation',
      }
    });
  } catch (error) {
    console.error('Error fetching cashflow summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cashflow summary' },
      { status: 500 }
    );
  }
}
