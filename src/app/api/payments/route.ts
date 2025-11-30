import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const payments = await db
      .collection('payments')
      .find()
      .sort({ paymentDate: -1 })
      .toArray();

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    // Get the invoice details
    const invoice = await db.collection('invoices').findOne({
      _id: new ObjectId(body.invoiceId),
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Create payment record
    const payment = {
      invoiceId: body.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId,
      clientName: invoice.clientName,
      amount: invoice.total,
      paymentMethod: body.paymentMethod,
      paymentDetails: body.paymentDetails || '',
      paymentDate: new Date(body.paymentDate),
      status: 'completed',
      createdAt: new Date(),
    };

    const result = await db.collection('payments').insertOne(payment);

    // Update invoice status to paid
    await db.collection('invoices').updateOne(
      { _id: new ObjectId(body.invoiceId) },
      {
        $set: {
          status: 'paid',
          paidAt: new Date(body.paymentDate),
          paymentMethod: body.paymentMethod,
          paymentDetails: body.paymentDetails || '',
        },
      }
    );

    return NextResponse.json({
      success: true,
      paymentId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
