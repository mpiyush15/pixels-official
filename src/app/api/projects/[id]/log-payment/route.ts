import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendPaymentConfirmationEmail } from '@/lib/email';

// Admin logs general payment (not tied to milestone)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, paymentMethod, paymentDetails } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Get the project
    const project = await db.collection('projects').findOne({ _id: new ObjectId(id) });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create payment record
    const paymentRecord = {
      projectId: id,
      clientId: project.clientId,
      amount: amount,
      paymentMethod: paymentMethod || 'offline',
      paymentDate: new Date(),
      status: 'completed',
      type: 'general', // Not tied to a milestone
      loggedBy: 'admin',
      paymentDetails: paymentDetails || 'Payment logged by admin',
      createdAt: new Date(),
    };

    const paymentResult = await db.collection('payments').insertOne(paymentRecord);

    // Auto-generate invoice for this payment
    const invoiceNumber = `INV-${Date.now()}`;
    const issueDate = new Date().toISOString().split('T')[0];

    await db.collection('invoices').insertOne({
      clientId: project.clientId,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      projectId: id,
      projectName: project.projectName || 'Project',
      invoiceNumber,
      issueDate,
      dueDate: issueDate,
      status: 'paid',
      paidDate: issueDate,
      items: [
        {
          description: 'Payment received - ' + (paymentDetails || 'General payment'),
          quantity: 1,
          rate: amount,
          amount: amount,
        },
      ],
      subtotal: amount,
      tax: 0,
      taxRate: 0,
      total: amount,
      notes: `Admin logged payment - ${paymentDetails || 'Payment received'}`,
      paymentMethod: paymentMethod || 'offline',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send payment confirmation email
    try {
      await sendPaymentConfirmationEmail(
        project.clientEmail,
        project.clientName,
        amount,
        invoiceNumber,
        new Date()
      );
      console.log('Payment confirmation email sent to:', project.clientEmail);
    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Payment logged successfully',
      invoiceGenerated: true,
      invoiceNumber,
      paymentId: paymentResult.insertedId,
    });
  } catch (error) {
    console.error('Error logging payment:', error);
    return NextResponse.json(
      { error: 'Failed to log payment' },
      { status: 500 }
    );
  }
}
