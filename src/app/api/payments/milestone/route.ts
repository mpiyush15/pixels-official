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

    console.log('Milestone payment request:', {
      projectId,
      milestoneIndex,
      amount,
      clientId,
    });

    // Get project and verify client ownership
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId),
    });

    if (!project) {
      console.error('Project not found:', projectId);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify client ownership - compare as strings
    const projectClientId = project.clientId?.toString() || project.clientId;
    if (projectClientId !== clientId) {
      console.error('Client ID mismatch:', { projectClientId, clientId });
      return NextResponse.json({ error: 'Unauthorized access to project' }, { status: 403 });
    }

    const milestone = project.milestones?.[milestoneIndex];
    if (!milestone) {
      console.error('Milestone not found at index:', milestoneIndex);
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Get client details
    const client = await db.collection('clients').findOne({
      _id: new ObjectId(clientId),
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Create Cashfree order using V2 API (Payment Link)
    const isProduction =
      process.env.CASHFREE_MODE === "PROD" ||
      process.env.CASHFREE_MODE === "PRODUCTION";

    const apiUrl = isProduction
      ? "https://api.cashfree.com/api/v2/order/create"
      : "https://sandbox.cashfree.com/api/v2/order/create";

    const orderId = `MILESTONE_${projectId}_${milestoneIndex}_${Date.now()}`;

    console.log('Creating Cashfree V2 order:', {
      orderId,
      amount,
      mode: process.env.CASHFREE_MODE,
      isProduction,
      apiUrl,
      clientId: process.env.CASHFREE_CLIENT_ID?.substring(0, 8) + '...',
    });

    const orderResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_CLIENT_ID!,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
      },
      body: JSON.stringify({
        appId: process.env.CASHFREE_CLIENT_ID!,
        secretKey: process.env.CASHFREE_CLIENT_SECRET!,
        orderId: orderId,
        orderAmount: amount,
        orderCurrency: "INR",
        customerName: client.name,
        customerEmail: client.email,
        customerPhone: client.phone || "9999999999",
        returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pixelsdigital.tech'}/payment/callback?type=milestone&project_id=${projectId}&milestone_index=${milestoneIndex}`,
        notifyUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pixelsdigital.tech'}/api/cashfree/webhook`,
        orderNote: `Payment for ${project.projectName} - ${milestone.name}`,
      }),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      console.error('Cashfree V2 order creation error:', {
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

    console.log('Cashfree V2 order created successfully:', {
      status: orderData.status,
      order_id: orderData.orderId,
      payment_link: orderData.paymentLink,
    });

    // V2 API returns payment_link directly - no session ID needed!
    const paymentUrl = orderData.paymentLink;

    if (!paymentUrl) {
      console.error('No payment link in Cashfree response:', orderData);
      return NextResponse.json(
        { error: 'Failed to generate payment link' },
        { status: 500 }
      );
    }

    console.log('Payment URL from Cashfree V2:', paymentUrl);

    // Store order info in milestone for tracking
    await db.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          [`milestones.${milestoneIndex}.cashfreeOrderId`]: orderData.orderId,
          [`milestones.${milestoneIndex}.paymentLink`]: paymentUrl,
          [`milestones.${milestoneIndex}.paymentInitiatedAt`]: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderId: orderData.orderId,
    });
  } catch (error) {
    console.error('Milestone payment error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate milestone payment' },
      { status: 500 }
    );
  }
}
