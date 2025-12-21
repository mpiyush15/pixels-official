import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

type Params = Promise<{ id: string }>;

// PUT - Update payment record (admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await jwtVerify(token, secret);

    const { id } = await context.params;
    const { status, transactionId } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const paymentsCollection = db.collection('staff_payments');

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    if (status === 'paid') {
      updateData.paidAt = new Date();
    }

    const result = await paymentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Payment updated successfully' });
  } catch (error: any) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}
