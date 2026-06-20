import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    // 1. Live Balances (From Cashflow Master Ledger)
    const cashflow = await db.collection('cashflow').find({}).toArray();
    let cashInHand = 0;
    let bankBalance = 0;
    let hasOpeningBalance = false;
    
    cashflow.forEach(entry => {
      // Check if any opening balance exists
      if (entry.category === 'opening_balance') {
        hasOpeningBalance = true;
      }

      // By default, if accountType is not specified, we'll assume 'bank' for legacy compatibility
      const accountType = entry.accountType || 'bank';
      const amount = entry.amount || 0;

      if (entry.type === 'income') {
        if (accountType === 'cash') cashInHand += amount;
        else bankBalance += amount;
      } else if (entry.type === 'expense') {
        if (accountType === 'cash') cashInHand -= amount;
        else bankBalance -= amount;
      }
    });

    // 2. Expected Receivables (Unpaid Invoices + Pipeline Receivables)
    const unpaidInvoices = await db.collection('invoices').find({ 
      status: { $in: ['sent', 'partially_paid', 'overdue'] } 
    }).toArray();
    
    let totalUnpaidInvoices = 0;
    unpaidInvoices.forEach(inv => {
      totalUnpaidInvoices += (inv.remainingAmount !== undefined ? inv.remainingAmount : (inv.total - (inv.amountPaid || 0)));
    });

    const pipelineReceivables = await db.collection('receivables').find({
      status: 'expected'
    }).toArray();
    
    const totalPipelineReceivables = pipelineReceivables.reduce((sum, r) => sum + (r.amount || 0), 0);
    const expectedReceivables = totalUnpaidInvoices + totalPipelineReceivables;

    // 3. Total Debts (Active Loans from Working Capital)
    const workingCapital = await db.collection('working-capital').find({}).toArray();
    const totalDebts = workingCapital
      .filter(wc => wc.type === 'loan' && wc.status === 'active')
      .reduce((sum, wc) => sum + (wc.amount || 0), 0);

    // 4. Expected Payables (Unpaid Expenses)
    const unpaidExpenses = await db.collection('expenses').find({
      paymentStatus: { $in: ['pending', 'overdue'] }
    }).toArray();
    
    const expectedPayables = unpaidExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // 5. Total Project Costs vs Revenue (Quick Profitability Overview)
    // Project Costs = sum of all expenses that have a projectId
    const projectCosts = await db.collection('expenses').find({
      projectId: { $ne: null }
    }).toArray();
    const totalProjectCosts = projectCosts.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Project Revenue = sum of all payments linked to an invoice that has a projectId
    // Wait, invoices have projectId, so we can sum the amountPaid of invoices that have a projectId.
    const projectInvoices = await db.collection('invoices').find({
      projectId: { $ne: null }
    }).toArray();
    const totalProjectRevenue = projectInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        hasOpeningBalance,
        cashInHand,
        bankBalance,
        liveBankBalance: cashInHand + bankBalance, // Kept for backwards compatibility
        expectedReceivables,
        breakdown: {
          unpaidInvoices: totalUnpaidInvoices,
          pipelineReceivables: totalPipelineReceivables,
        },
        totalDebts,
        expectedPayables,
        profitability: {
          totalProjectRevenue,
          totalProjectCosts,
          margin: totalProjectRevenue - totalProjectCosts
        }
      }
    });
  } catch (error) {
    console.error('Error fetching finance overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch finance overview' },
      { status: 500 }
    );
  }
}
