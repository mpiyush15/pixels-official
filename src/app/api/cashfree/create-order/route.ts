import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planName, planPrice, customerName, customerEmail, customerPhone } = body;

    // Validate input
    if (!planName || !planPrice || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // For production mode, use production URL, otherwise sandbox
    const baseUrl = process.env.CASHFREE_MODE === 'production'
      ? 'https://api.cashfree.com'
      : 'https://sandbox.cashfree.com';

    // Create order request
    const orderRequest = {
      order_id: orderId,
      order_amount: planPrice,
      order_currency: 'INR',
      customer_details: {
        customer_id: `CUST_${Date.now()}`,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback?order_id=${orderId}`,
      },
      order_note: `Payment for ${planName} - Social Media Marketing Plan`,
    };

    // Create order in Cashfree using REST API
    console.log('Creating order with base URL:', baseUrl);
    console.log('Using Client ID:', process.env.CASHFREE_CLIENT_ID);
    console.log('Order details:', { orderId, planPrice, customerEmail });
    
    const response = await fetch(`${baseUrl}/pg/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_CLIENT_ID!,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
      },
      body: JSON.stringify(orderRequest),
    });

    const data = await response.json();

    if (response.ok && data.payment_session_id) {
      return NextResponse.json({
        success: true,
        orderId: orderId,
        paymentSessionId: data.payment_session_id,
        orderToken: data.order_token,
      });
    } else {
      console.error('Cashfree API error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      throw new Error(data.message || 'Failed to create order');
    }
  } catch (error: any) {
    console.error('Cashfree order creation error:', error);
    
    // Provide helpful error message for development
    const errorMessage = process.env.CASHFREE_MODE === 'sandbox' 
      ? 'Sandbox credentials invalid. Please get your sandbox API keys from Cashfree dashboard or deploy to production with HTTPS.'
      : error.message;
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment order',
        message: errorMessage,
        hint: process.env.CASHFREE_MODE === 'sandbox' 
          ? 'Get sandbox credentials from: https://merchant.cashfree.com/merchants/login'
          : 'Ensure your domain uses HTTPS'
      },
      { status: 500 }
    );
  }
}
