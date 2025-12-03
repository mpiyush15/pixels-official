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

    // Create Cashfree order using V2 API (Payment Link)
    const isProduction =
      process.env.CASHFREE_MODE === "PROD" ||
      process.env.CASHFREE_MODE === "PRODUCTION" ||
      process.env.CASHFREE_MODE === "production";

    const apiUrl = isProduction
      ? "https://api.cashfree.com/api/v2/order/create"
      : "https://sandbox.cashfree.com/api/v2/order/create";

    const orderId = `INV_${invoice.invoiceNumber}_${Date.now()}`;
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pixelsdigital.tech';

    console.log('Creating Cashfree V2 invoice payment order:', {
      orderId,
      amount: invoice.total,
      mode: process.env.CASHFREE_MODE,
      isProduction,
      apiUrl,
      baseUrl,
      clientId: process.env.CASHFREE_CLIENT_ID?.substring(0, 8) + '...',
    });

    const orderResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_CLIENT_ID!,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
      },
      body: JSON.stringify({
        appId: process.env.CASHFREE_CLIENT_ID!,
        secretKey: process.env.CASHFREE_CLIENT_SECRET!,
        orderId: orderId,
        orderAmount: invoice.total,
        orderCurrency: 'INR',
        customerName: invoice.clientName,
        customerEmail: invoice.clientEmail,
        customerPhone: invoice.clientPhone || '9999999999',
        returnUrl: `${baseUrl}/payment/callback?invoice_id=${id}`,
        notifyUrl: `${baseUrl}/api/cashfree/webhook`,
        orderNote: `Payment for Invoice ${invoice.invoiceNumber}`,
      }),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      console.error('Cashfree V2 invoice order creation error:', {
        status: orderResponse.status,
        error,
      });
      return NextResponse.json(
        { error: 'Failed to create payment link' },
        { status: 500 }
      );
    }

    const orderData = await orderResponse.json();

    console.log('Cashfree V2 invoice order created:', {
      status: orderData.status,
      orderId: orderData.orderId,
      paymentLink: orderData.paymentLink,
    });

    // V2 API returns paymentLink directly
    const paymentUrl = orderData.paymentLink;

    if (!paymentUrl) {
      console.error('No payment link in Cashfree response:', orderData);
      return NextResponse.json(
        { error: 'Failed to generate payment link' },
        { status: 500 }
      );
    }

    // Update invoice with payment link details
    await db.collection('invoices').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          paymentLink: paymentUrl,
          cashfreeOrderId: orderData.orderId,
          paymentLinkCreatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      paymentLink: paymentUrl,
      orderId: orderData.orderId,
    });
  } catch (error) {
    console.error('Generate payment link error:', error);
    return NextResponse.json(
      { error: 'Failed to generate payment link' },
      { status: 500 }
    );
  }
}
