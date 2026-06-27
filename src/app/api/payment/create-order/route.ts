import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import Cashfree from '@/lib/cashfree';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const project = await db.collection('projects').findOne({ proposalToken: token });

    if (!project || project.contractAccepted) {
      return NextResponse.json({ error: 'Proposal not found or already accepted' }, { status: 404 });
    }

    // Determine the amount to pay (first incomplete milestone or full budget)
    const nextMilestone = project.milestones?.find((m: any) => m.status !== 'completed');
    const orderAmount = nextMilestone ? (nextMilestone.amount || 0) : (project.budget || 0);

    if (orderAmount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // In Cashfree, order_id must be alphanumeric and max 50 chars
    const createOrderRequest = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: `CUST_${project._id.toString()}`,
        customer_email: project.clientEmail || 'client@example.com',
        customer_phone: '9999999999', // Should ideally come from project/client, using fallback for now
        customer_name: project.clientName || 'Client'
      },
      order_meta: {
        return_url: `${'https://pixelsdigitalsolutions.com'}/client-portal/login?order_id={order_id}`,
        notify_url: `${'https://pixelsdigitalsolutions.com'}/api/payment/webhook` // Optional webhook
      }
    };

    const response = await Cashfree.PGCreateOrder(createOrderRequest);
    
    return NextResponse.json({
      success: true,
      orderId: orderId,
      paymentSessionId: response.data.payment_session_id
    });

  } catch (error: any) {
    console.error('Error creating Cashfree order:', error?.response?.data || error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
