import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const invoice = await db.collection('invoices').findOne({
      _id: new ObjectId(id),
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Create Cashfree order
    const baseUrl = process.env.CASHFREE_MODE === 'production'
      ? 'https://api.cashfree.com'
      : 'https://sandbox.cashfree.com';

    const orderResponse = await fetch(
      `${baseUrl}/pg/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': process.env.CASHFREE_CLIENT_ID!,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
          'x-api-version': '2023-08-01',
        },
        body: JSON.stringify({
          order_id: `INV_${invoice.invoiceNumber}_${Date.now()}`,
          order_amount: invoice.total,
          order_currency: 'INR',
          customer_details: {
            customer_id: invoice.clientId,
            customer_name: invoice.clientName,
            customer_email: invoice.clientEmail,
            customer_phone: invoice.clientPhone || '9999999999',
          },
          order_meta: {
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback?invoice_id=${id}`,
          },
          order_note: `Payment for Invoice ${invoice.invoiceNumber}`,
        }),
      }
    );

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      console.error('Cashfree order creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create payment link' },
        { status: 500 }
      );
    }

    const orderData = await orderResponse.json();

    // Generate payment URL based on mode
    const paymentUrl = process.env.CASHFREE_MODE === 'production'
      ? `https://payments.cashfree.com/order/${orderData.payment_session_id}`
      : `https://sandbox.cashfree.com/pg/view/order/${orderData.payment_session_id}`;

    // Update invoice with payment link details
    await db.collection('invoices').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          paymentLink: paymentUrl,
          cashfreeOrderId: orderData.order_id,
          paymentSessionId: orderData.payment_session_id,
          paymentLinkCreatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      paymentLink: paymentUrl,
      orderId: orderData.order_id,
      sessionId: orderData.payment_session_id,
    });
  } catch (error) {
    console.error('Generate payment link error:', error);
    return NextResponse.json(
      { error: 'Failed to generate payment link' },
      { status: 500 }
    );
  }
}
