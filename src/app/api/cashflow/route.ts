import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const cashFlow = await db
      .collection('cashflow')
      .find({})
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json(cashFlow);
  } catch (error) {
    console.error('Error fetching cash flow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cash flow' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const transaction = {
      type: body.type, // income, expense
      category: body.category, // salary, revenue, expense, transfer
      description: body.description,
      amount: parseFloat(body.amount),
      date: body.date,
      accountType: body.accountType, // cash, bank
      bankName: body.bankName || '',
      paymentMethod: body.paymentMethod || '',
      reference: body.reference || '', // Invoice number, salary ID, etc.
      notes: body.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('cashflow').insertOne(transaction);

    return NextResponse.json({
      success: true,
      transactionId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
