import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const payments = await db
      .collection('payments')
      .find()
      .sort({ paymentDate: -1 })
      .toArray();

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    // Get the invoice details
    const invoice = await db.collection('invoices').findOne({
      _id: new ObjectId(body.invoiceId),
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Use provided amount or full invoice amount
    const paymentAmount = body.amount ? parseFloat(body.amount) : invoice.total;

    // Validate payment amount
    if (paymentAmount <= 0) {
      return NextResponse.json(
        { error: 'Payment amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Calculate total paid so far
    const existingPayments = await db
      .collection('payments')
      .find({ invoiceId: body.invoiceId, status: 'completed' })
      .toArray();

    const totalPaid = existingPayments.reduce((sum, p) => sum + (p.amount || 0), 0) + paymentAmount;
    const remainingAmount = invoice.total - totalPaid;

    // Check if overpayment
    if (totalPaid > invoice.total) {
      return NextResponse.json(
        { error: `Payment amount exceeds remaining balance. Remaining: ₹${remainingAmount + paymentAmount}` },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = {
      invoiceId: body.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId,
      clientName: invoice.clientName,
      amount: paymentAmount,
      paymentMethod: body.paymentMethod,
      paymentDetails: body.paymentDetails || '',
      paymentDate: new Date(body.paymentDate),
      status: 'completed',
      isPartialPayment: paymentAmount < invoice.total,
      createdAt: new Date(),
    };

    const result = await db.collection('payments').insertOne(payment);

    // Determine new invoice status
    let invoiceStatus = 'sent';
    if (totalPaid >= invoice.total) {
      invoiceStatus = 'paid';
    } else if (totalPaid > 0) {
      invoiceStatus = 'partially_paid';
    }

    // Update invoice with payment info and amount paid
    const invoiceUpdate: any = {
      status: invoiceStatus,
      amountPaid: totalPaid,
      remainingAmount: remainingAmount,
      paymentMethod: body.paymentMethod,
      paymentDetails: body.paymentDetails || '',
      updatedAt: new Date(),
    };

    // Only set paidAt if fully paid
    if (invoiceStatus === 'paid') {
      invoiceUpdate.paidAt = new Date(body.paymentDate);
    }

    await db.collection('invoices').updateOne(
      { _id: new ObjectId(body.invoiceId) },
      { $set: invoiceUpdate }
    );

    // Auto-create cash flow entry
    // Determine account type: cash payment method = cash, all others = bank
    const accountType = body.paymentMethod === 'cash' ? 'cash' : 'bank';
    
    const cashFlowEntry = {
      type: 'income',
      category: 'revenue',
      amount: paymentAmount,
      accountType: accountType,
      paymentMethod: body.paymentMethod,
      bankName: body.paymentDetails || '',
      reference: `Invoice #${invoice.invoiceNumber}${payment.isPartialPayment ? ' (Partial)' : ''}`,
      description: `Payment received from ${invoice.clientName}${payment.isPartialPayment ? ` - Partial payment ₹${paymentAmount} of ₹${invoice.total}` : ''}`,
      transactionDate: new Date(body.paymentDate),
      clientId: invoice.clientId,
      clientName: invoice.clientName,
      invoiceId: body.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      paymentId: result.insertedId.toString(),
      createdAt: new Date(),
    };

    await db.collection('cashflow').insertOne(cashFlowEntry);

    return NextResponse.json({
      success: true,
      paymentId: result.insertedId,
      totalPaid: totalPaid,
      remainingAmount: remainingAmount,
      invoiceStatus: invoiceStatus,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
