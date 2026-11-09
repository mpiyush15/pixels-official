import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createInvoicePaymentLink } from '@/lib/razorpay';

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

    // Calculate remaining amount to pay
    const amountPaid = invoice.amountPaid || 0;
    const remainingAmount = invoice.total - amountPaid;

    // If already fully paid, don't generate link
    if (remainingAmount <= 0 || invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already fully paid' },
        { status: 400 }
      );
    }

    // If active Razorpay payment link already exists and amount hasn't changed, reuse it
    if (invoice.paymentLink && invoice.razorpayPaymentLinkId && !invoice.linkExpired) {
      return NextResponse.json({
        success: true,
        paymentLink: invoice.paymentLink,
        orderId: invoice.razorpayPaymentLinkId,
      });
    }

    // Create Razorpay payment link
    const paymentLinkData = await createInvoicePaymentLink(invoice, remainingAmount);

    const paymentUrl = paymentLinkData.short_url || (paymentLinkData as any).url;

    if (!paymentUrl) {
      console.error('No payment link in Razorpay response:', paymentLinkData);
      return NextResponse.json(
        { error: 'Failed to generate payment link' },
        { status: 500 }
      );
    }

    // Update invoice with Razorpay payment link details
    await db.collection('invoices').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          paymentLink: paymentUrl,
          razorpayPaymentLinkId: paymentLinkData.id,
          paymentLinkCreatedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      paymentLink: paymentUrl,
      orderId: paymentLinkData.id,
    });
  } catch (error: any) {
    console.error('Generate Razorpay payment link error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate payment link' },
      { status: 500 }
    );
  }
}
