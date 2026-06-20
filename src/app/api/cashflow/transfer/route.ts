import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const { fromAccount, toAccount, amount, notes, date } = body;

    if (!fromAccount || !toAccount || !amount || amount <= 0 || fromAccount === toAccount) {
      return NextResponse.json({ error: 'Invalid transfer parameters' }, { status: 400 });
    }

    const transactionDate = new Date(date || new Date());
    const createdAt = new Date();
    
    // Create the Debit entry (taking money out of fromAccount)
    const debitEntry = {
      type: 'expense', // Expense in cashflow means money out
      category: 'transfer',
      amount: parseFloat(amount),
      accountType: fromAccount,
      reference: `Transfer to ${toAccount.toUpperCase()}`,
      description: notes || `Contra Transfer to ${toAccount}`,
      transactionDate: transactionDate,
      date: transactionDate.toISOString(),
      createdAt: createdAt,
    };

    // Create the Credit entry (putting money into toAccount)
    const creditEntry = {
      type: 'income', // Income in cashflow means money in
      category: 'transfer',
      amount: parseFloat(amount),
      accountType: toAccount,
      reference: `Transfer from ${fromAccount.toUpperCase()}`,
      description: notes || `Contra Transfer from ${fromAccount}`,
      transactionDate: transactionDate,
      date: transactionDate.toISOString(),
      createdAt: createdAt,
    };

    const result = await db.collection('cashflow').insertMany([debitEntry, creditEntry]);

    return NextResponse.json({ success: true, message: 'Transfer successful', result }, { status: 201 });
  } catch (error) {
    console.error('Error processing transfer:', error);
    return NextResponse.json(
      { error: 'Failed to process transfer' },
      { status: 500 }
    );
  }
}
