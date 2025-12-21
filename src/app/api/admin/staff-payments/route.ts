import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// GET all staff payments (admin only)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await jwtVerify(token, secret);

    const db = await getDatabase();
    
    // Check if collection exists
    const collections = await db.listCollections({ name: 'staff_payments' }).toArray();
    if (collections.length === 0) {
      // Collection doesn't exist yet, return empty array
      return NextResponse.json([]);
    }
    
    const paymentsCollection = db.collection('staff_payments');

    const payments = await paymentsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST - Create new payment record (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await jwtVerify(token, secret);

    const { staffId, staffName, month, amount, tasksCompleted, notes } = await request.json();

    if (!staffId || !staffName || !month || !amount || tasksCompleted === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const paymentsCollection = db.collection('staff_payments');

    const newPayment = {
      staffId,
      staffName,
      month,
      amount,
      tasksCompleted,
      status: 'pending',
      notes: notes || '',
      createdAt: new Date(),
    };

    const result = await paymentsCollection.insertOne(newPayment);

    return NextResponse.json({ 
      message: 'Payment record created successfully',
      paymentId: result.insertedId,
    });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment record' },
      { status: 500 }
    );
  }
}
