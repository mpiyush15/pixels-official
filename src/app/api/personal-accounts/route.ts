import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const transactions = await db
      .collection('personal_accounts')
      .find({})
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching personal accounts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch personal accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const transaction = {
      type: body.type, // 'income' or 'expense'
      category: body.category, // 'salary', 'food', 'travel', 'shopping', 'bills', 'investment', 'other'
      amount: parseFloat(body.amount),
      date: body.date,
      description: body.description || '',
      paymentMethod: body.paymentMethod || 'bank_transfer', // bank_transfer, upi, cash, card
      notes: body.notes || '',
      salaryId: body.salaryId || null, // Link to business salary if type is income from salary
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('personal_accounts').insertOne(transaction);

    return NextResponse.json({
      success: true,
      transactionId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating personal transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create personal transaction' },
      { status: 500 }
    );
  }
}
