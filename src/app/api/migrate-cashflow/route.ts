import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    let migratedCount = 0;

    // 1. Migrate all PAID invoices to cash flow
    const paidInvoices = await db
      .collection('invoices')
      .find({ status: 'paid' })
      .toArray();

    for (const invoice of paidInvoices) {
      // Check if cash flow entry already exists
      const existingEntry = await db
        .collection('cashflow')
        .findOne({ invoiceId: invoice._id.toString() });

      if (!existingEntry) {
        const accountType = invoice.paymentMethod === 'cash' ? 'cash' : 'bank';

        const cashFlowEntry = {
          type: 'income',
          category: 'revenue',
          amount: invoice.total,
          accountType: accountType,
          paymentMethod: invoice.paymentMethod || 'bank_transfer',
          bankName: invoice.paymentDetails || '',
          reference: `Invoice #${invoice.invoiceNumber}`,
          description: `Payment received from ${invoice.clientName}`,
          transactionDate: invoice.paidAt || invoice.dueDate || new Date(),
          clientId: invoice.clientId,
          clientName: invoice.clientName,
          invoiceId: invoice._id.toString(),
          invoiceNumber: invoice.invoiceNumber,
          createdAt: new Date(),
        };

        await db.collection('cashflow').insertOne(cashFlowEntry);
        migratedCount++;
      }
    }

    // 2. Migrate all PAID expenses to cash flow
    const paidExpenses = await db
      .collection('expenses')
      .find({ paymentStatus: 'paid' })
      .toArray();

    for (const expense of paidExpenses) {
      // Check if cash flow entry already exists
      const existingEntry = await db
        .collection('cashflow')
        .findOne({ expenseId: expense._id.toString() });

      if (!existingEntry) {
        const accountType = expense.paymentMethod === 'cash' ? 'cash' : 'bank';

        const cashFlowEntry = {
          type: 'expense',
          category: 'expense',
          amount: expense.amount,
          accountType: accountType,
          paymentMethod: expense.paymentMethod || 'bank_transfer',
          reference: expense.invoiceNumber || `Expense #${expense._id}`,
          description: `${expense.category} - ${expense.description}`,
          transactionDate: new Date(expense.date),
          vendorId: expense.vendorId,
          vendorName: expense.vendorName,
          expenseId: expense._id.toString(),
          expenseCategory: expense.category,
          createdAt: new Date(),
        };

        await db.collection('cashflow').insertOne(cashFlowEntry);
        migratedCount++;
      }
    }

    // 3. Migrate all PAID salaries to cash flow
    const paidSalaries = await db
      .collection('salaries')
      .find({ status: 'paid' })
      .toArray();

    for (const salary of paidSalaries) {
      // Check if cash flow entry already exists
      const existingEntry = await db
        .collection('cashflow')
        .findOne({ salaryId: salary._id.toString() });

      if (!existingEntry) {
        const cashFlowEntry = {
          type: 'expense',
          category: 'salary',
          amount: salary.netAmount,
          accountType: salary.accountType || 'bank',
          paymentMethod: salary.paymentMethod || 'bank_transfer',
          bankName: salary.bankName || '',
          reference: `Salary - ${salary.employeeName} (${salary.month}/${salary.year})`,
          description: `Salary payment to ${salary.employeeName}${salary.designation ? ` - ${salary.designation}` : ''}`,
          transactionDate: new Date(salary.paymentDate || new Date()),
          employeeName: salary.employeeName,
          employeeId: salary.employeeId,
          salaryId: salary._id.toString(),
          salaryMonth: salary.month,
          salaryYear: salary.year,
          createdAt: new Date(),
        };

        await db.collection('cashflow').insertOne(cashFlowEntry);
        migratedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${migratedCount} transactions to cash flow`,
      details: {
        invoices: paidInvoices.length,
        expenses: paidExpenses.length,
        salaries: paidSalaries.length,
        migratedCount: migratedCount,
      },
    });
  } catch (error) {
    console.error('Error migrating cash flow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to migrate cash flow data' },
      { status: 500 }
    );
  }
}
