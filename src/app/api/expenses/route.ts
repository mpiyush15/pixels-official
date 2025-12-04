import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
      category: body.category, // hosting, domain, internet, social_media, communication, software, utilities, other
      description: body.description,
      amount: parseFloat(body.amount),
      date: body.date,
      paymentMethod: body.paymentMethod || 'bank_transfer', // bank_transfer, upi, cash, card, cheque
      paymentStatus: body.paymentStatus || 'paid', // paid, pending, overdue
      invoiceNumber: body.invoiceNumber || '',
      notes: body.notes || '',
      recurringType: body.recurringType || 'one_time', // one_time, monthly, quarterly, yearly
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
