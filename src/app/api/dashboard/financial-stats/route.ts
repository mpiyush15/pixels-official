import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();

    // Get total revenue from paid and partially paid invoices
    const paidInvoices = await db.collection('invoices').find({ status: 'paid' }).toArray();
    const partiallyPaidInvoices = await db.collection('invoices').find({ status: 'partially_paid' }).toArray();
    
    const fullyPaidRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const partialRevenue = partiallyPaidInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const totalRevenue = fullyPaidRevenue + partialRevenue;

    // Get total expenses
    const expenses = await db.collection('expenses').find({ paymentStatus: 'paid' }).toArray();
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Get total salaries paid
    const salaries = await db.collection('salaries').find({ status: 'paid' }).toArray();
    const totalSalaries = salaries.reduce((sum, sal) => sum + (sal.netAmount || 0), 0);

    // Get cash flow balances
    const cashFlowTransactions = await db.collection('cashflow').find({}).toArray();
    
    let cashBalance = 0;
    let bankBalance = 0;

    cashFlowTransactions.forEach(txn => {
      const amount = txn.amount || 0;
      if (txn.accountType === 'cash') {
        cashBalance += txn.type === 'income' ? amount : -amount;
      } else if (txn.accountType === 'bank') {
        bankBalance += txn.type === 'income' ? amount : -amount;
      }
    });

    // Calculate net profit (Revenue - Expenses - Salaries)
    const netProfit = totalRevenue - totalExpenses - totalSalaries;

    // Get current month stats
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const allInvoices = [...paidInvoices, ...partiallyPaidInvoices];
    
    const monthlyRevenue = allInvoices
      .filter((inv: any) => {
        if (!inv.paidAt && !inv.amountPaid) return false;
        const paidDate = new Date(inv.paidAt || inv.updatedAt);
        return paidDate.getMonth() + 1 === currentMonth && paidDate.getFullYear() === currentYear;
      })
      .reduce((sum: number, inv: any) => {
        if (inv.status === 'paid') return sum + (inv.total || 0);
        if (inv.status === 'partially_paid') return sum + (inv.amountPaid || 0);
        return sum;
      }, 0);

    const monthlyExpenses = expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() + 1 === currentMonth && expDate.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const monthlySalaries = salaries
      .filter(sal => sal.month === currentMonth && sal.year === currentYear)
      .reduce((sum, sal) => sum + (sal.netAmount || 0), 0);

    const monthlyProfit = monthlyRevenue - monthlyExpenses - monthlySalaries;

    // Get pending payments (including remaining on partial invoices)
    const unpaidInvoices = await db.collection('invoices')
      .find({ status: { $in: ['sent', 'overdue'] } })
      .toArray();
    const unpaidAmount = unpaidInvoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
    const partiallyPaidRemaining = partiallyPaidInvoices.reduce((sum: number, inv: any) => 
      sum + (inv.remainingAmount || (inv.total - (inv.amountPaid || 0))), 0
    );
    const pendingAmount = unpaidAmount + partiallyPaidRemaining;

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        totalSalaries,
        netProfit,
        cashBalance,
        bankBalance,
        totalBalance: cashBalance + bankBalance,
        monthlyRevenue,
        monthlyExpenses,
        monthlySalaries,
        monthlyProfit,
        pendingAmount,
        activeClients: await db.collection('clients').countDocuments({ status: 'active' }),
        activeProjects: await db.collection('projects').countDocuments({ 
          status: { $in: ['in_progress', 'on_hold'] } 
        }),
      }
    });
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial stats' },
      { status: 500 }
    );
  }
}
