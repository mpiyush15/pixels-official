import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const clientAuth = cookieStore.get('client-session');

    if (!clientAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, milestoneIndex, amount } = await req.json();

    if (!projectId || milestoneIndex === undefined || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const clientId = clientAuth.value;
    const db = await getDatabase();

    // Get project and verify client ownership
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId),
      clientId,
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const milestone = project.milestones?.[milestoneIndex];
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Get client details
    const client = await db.collection('clients').findOne({
      _id: new ObjectId(clientId),
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Create Cashfree order
    const baseUrl = process.env.CASHFREE_MODE === 'production'
      ? 'https://api.cashfree.com'
      : 'https://sandbox.cashfree.com';

    const orderId = `MILESTONE_${projectId}_${milestoneIndex}_${Date.now()}`;

    console.log('Creating Cashfree order:', {
      orderId,
      amount,
      mode: process.env.CASHFREE_MODE,
      baseUrl,
      clientId: process.env.CASHFREE_CLIENT_ID?.substring(0, 8) + '...',
    });

    const orderResponse = await fetch(`${baseUrl}/pg/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_CLIENT_ID!,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: clientId,
          customer_name: client.name,
          customer_email: client.email,
          customer_phone: client.phone || '9999999999',
        },
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pixelsdigital.tech'}/payment/callback?type=milestone&project_id=${projectId}&milestone_index=${milestoneIndex}`,
        },
        order_note: `Payment for ${project.projectName} - ${milestone.name}`,
      }),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      console.error('Cashfree order creation error:', {
        status: orderResponse.status,
        statusText: orderResponse.statusText,
        error,
        mode: process.env.CASHFREE_MODE,
        clientId: process.env.CASHFREE_CLIENT_ID?.substring(0, 8) + '...',
      });
      return NextResponse.json(
        { 
          error: 'Failed to create payment order',
          details: error.message || 'Cashfree API error',
          cashfreeError: error,
        },
        { status: 500 }
      );
    }

    const orderData = await orderResponse.json();

    // Generate payment URL
    const paymentUrl = process.env.CASHFREE_MODE === 'production'
      ? `https://payments.cashfree.com/order/${orderData.payment_session_id}`
      : `https://sandbox.cashfree.com/pg/view/order/${orderData.payment_session_id}`;

    // Store order info in milestone for tracking
    await db.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          [`milestones.${milestoneIndex}.cashfreeOrderId`]: orderData.order_id,
          [`milestones.${milestoneIndex}.paymentSessionId`]: orderData.payment_session_id,
          [`milestones.${milestoneIndex}.paymentInitiatedAt`]: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderId: orderData.order_id,
    });
  } catch (error) {
    console.error('Milestone payment error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate milestone payment' },
      { status: 500 }
    );
  }
}
