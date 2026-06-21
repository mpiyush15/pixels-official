import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { FinanceDB } from '@/lib/finance';

export async function GET() {
  try {
    const db = await getDatabase();
    const expenses = await db
      .collection('expenses')
      .find({})
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const expense = {
      vendorId: body.vendorId || null,
      vendorName: body.vendorName || '',
      clientId: body.clientId || null,
      clientName: body.clientName || '',
      projectId: body.projectId || null,
      projectName: body.projectName || '',
      category: body.category, // hosting, domain, internet, social_media, communication, software, utilities, other
      description: body.description,
      amount: parseFloat(body.amount),
      date: body.date,
      paymentMethod: body.paymentMethod || 'bank_transfer',
      paidFrom: body.paidFrom || '', // This will now be paymentAccountId
      expenseAccountId: body.expenseAccountId || '',
      paymentStatus: body.paymentStatus || 'paid',
      invoiceNumber: body.invoiceNumber || '',
      notes: body.notes || '',
      recurringType: body.recurringType || 'one_time',
      nextDueDate: body.nextDueDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('expenses').insertOne(expense);

    // Update vendor totalPaid if vendorId exists
    if (expense.vendorId && expense.paymentStatus === 'paid') {
      await db.collection('vendors').updateOne(
        { _id: new ObjectId(expense.vendorId) },
        { 
          $inc: { totalPaid: expense.amount },
          $set: { updatedAt: new Date() }
        }
      );
    }

    // Auto-create double-entry journal record if expense is paid
    if (expense.paymentStatus === 'paid' && expense.expenseAccountId && expense.paidFrom) {
      await FinanceDB.ensureSystemAccounts();

      await FinanceDB.createJournalEntry([
          {
              accountId: expense.expenseAccountId,
              type: 'Debit',
              amount: expense.amount,
              currency: 'INR',
              date: new Date(expense.date),
              description: `Expense: ${expense.category} - ${expense.description}`,
              referenceId: result.insertedId.toString(),
              referenceType: 'Expense'
          },
          {
              accountId: expense.paidFrom, // This is paymentAccountId
              type: 'Credit',
              amount: expense.amount,
              currency: 'INR',
              date: new Date(expense.date),
              description: `Payment for Expense: ${expense.category} - ${expense.description}`,
              referenceId: result.insertedId.toString(),
              referenceType: 'Expense'
          }
      ]);
    }

    return NextResponse.json(
      { _id: result.insertedId, ...expense },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
