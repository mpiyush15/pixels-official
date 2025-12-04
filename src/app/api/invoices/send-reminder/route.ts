import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentReminderEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { clientEmail, clientName, invoiceNumber, amount, dueDate } = await request.json();

    if (!clientEmail || !clientName || !invoiceNumber || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send payment reminder email
    const result = await sendPaymentReminderEmail(
      clientEmail,
      clientName,
      amount,
      new Date(dueDate),
      invoiceNumber
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Payment reminder sent successfully',
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send reminder email',
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Send reminder error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send payment reminder',
    }, { status: 500 });
  }
}
