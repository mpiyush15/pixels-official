import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentReminderEmail } from '@/lib/email';
import { getDatabase } from '@/lib/mongodb';
import { createInvoicePaymentLink } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const { clientEmail, clientName, invoiceNumber, amount, dueDate, invoiceId } = await request.json();

    if (!clientEmail || !clientName || !invoiceNumber || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    // Look up invoice to find existing payment link or auto-generate
    const query: any = invoiceId ? { _id: invoiceId } : { invoiceNumber };
    const invoice = await db.collection('invoices').findOne(query);

    let paymentLink = invoice?.paymentLink;

    if (!paymentLink && invoice) {
      try {
        const remainingAmount = invoice.total - (invoice.amountPaid || 0);
        if (remainingAmount > 0) {
          const linkData = await createInvoicePaymentLink(invoice, remainingAmount);
          paymentLink = linkData.short_url || (linkData as any).url;
          if (paymentLink) {
            await db.collection('invoices').updateOne(
              { _id: invoice._id },
              {
                $set: {
                  paymentLink,
                  razorpayPaymentLinkId: linkData.id,
                  paymentLinkCreatedAt: new Date(),
                  updatedAt: new Date(),
                },
              }
            );
          }
        }
      } catch (linkErr) {
        console.warn('Could not auto-generate Razorpay payment link for reminder:', linkErr);
      }
    }

    // Send payment reminder email with Razorpay Pay Now button
    const result = await sendPaymentReminderEmail(
      clientEmail,
      clientName,
      amount,
      new Date(dueDate),
      invoiceNumber,
      paymentLink
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Payment reminder sent successfully',
        messageId: result.messageId,
        paymentLink,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send reminder email',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Send reminder error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send payment reminder',
      },
      { status: 500 }
    );
  }
}
