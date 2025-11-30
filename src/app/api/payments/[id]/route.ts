import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();

    // Get the payment
    const payment = await db.collection('payments').findOne({
      _id: new ObjectId(id),
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (body.status === 'cancelled') {
      // Update payment status to cancelled
      await db.collection('payments').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: 'cancelled',
            cancelReason: body.cancelReason,
            cancelledAt: new Date().toISOString(),
          },
        }
      );

      // Revert invoice status back to 'sent'
      await db.collection('invoices').updateOne(
        { _id: new ObjectId(payment.invoiceId) },
        {
          $set: {
            status: 'sent',
          },
          $unset: {
            paidAt: '',
            paymentMethod: '',
            paymentDetails: '',
          },
        }
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid status' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}
