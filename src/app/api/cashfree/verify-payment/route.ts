import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.CASHFREE_MODE === 'PROD'
      ? 'https://api.cashfree.com'
      : 'https://sandbox.cashfree.com';

    // Fetch order status from Cashfree
    const response = await fetch(`${baseUrl}/pg/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID!,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        order_id: data.order_id,
        order_status: data.order_status,
        order_amount: data.order_amount,
        payment_method: data.payment_method,
        customer_details: data.customer_details,
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: data.message || 'Failed to verify payment' 
        },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to verify payment',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
