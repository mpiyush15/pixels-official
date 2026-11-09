import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay';
import { createAndUploadInvoice } from '@/lib/invoiceGenerator';
import { sendPaymentConfirmationEmail } from '@/lib/email';
import { FinanceDB } from '@/lib/finance';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('❌ Razorpay webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else if (webhookSecret && !signature) {
      console.warn('⚠️ Razorpay webhook secret configured but signature header missing');
      return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    console.log(`🔔 Razorpay Webhook Event Received: ${eventType}`);

    const db = await getDatabase();

    // 1. Handle Payment Link Paid or Payment Captured
    if (eventType === 'payment_link.paid' || eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentLinkEntity = event.payload?.payment_link?.entity;
      const paymentEntity = event.payload?.payment?.entity;

      // Extract invoiceId from notes
      const invoiceId = paymentLinkEntity?.notes?.invoiceId || 
                        paymentEntity?.notes?.invoiceId || 
                        paymentLinkEntity?.notes?.invoice_id;
      
      const paymentLinkId = paymentLinkEntity?.id;
      const paymentId = paymentEntity?.id || event.payload?.payment_link?.entity?.payment_id || `rzp_${Date.now()}`;
      const amountInRupees = paymentEntity?.amount ? paymentEntity.amount / 100 : (paymentLinkEntity?.amount ? paymentLinkEntity.amount / 100 : 0);

      // Locate invoice
      let invoice = null;
      if (invoiceId && ObjectId.isValid(invoiceId)) {
        invoice = await db.collection('invoices').findOne({ _id: new ObjectId(invoiceId) });
      } else if (paymentLinkId) {
        invoice = await db.collection('invoices').findOne({ razorpayPaymentLinkId: paymentLinkId });
      }

      if (!invoice) {
        console.warn('⚠️ Webhook received payment for unknown or missing invoice:', { invoiceId, paymentLinkId });
        return NextResponse.json({ success: true, message: 'Event logged; invoice not matched' });
      }

      // Check if invoice is already marked as paid
      if (invoice.status === 'paid') {
        console.log(`ℹ️ Invoice #${invoice.invoiceNumber} is already marked as paid`);
        return NextResponse.json({ success: true, message: 'Invoice already paid' });
      }

      const totalAmount = invoice.total;
      const paidDate = new Date();

      // A. Update Invoice in MongoDB
      await db.collection('invoices').updateOne(
        { _id: invoice._id },
        {
          $set: {
            status: 'paid',
            amountPaid: totalAmount,
            remainingAmount: 0,
            paidAt: paidDate,
            paymentMethod: 'razorpay',
            razorpayPaymentId: paymentId,
            razorpayPaymentDetails: paymentEntity || null,
            updatedAt: paidDate,
          },
        }
      );

      // B. Regenerate S3 PDF with official "PAID" stamp and watermark
      try {
        const invoiceData: any = {
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          clientCompany: invoice.clientCompany,
          clientAddress: invoice.clientAddress,
          invoiceDate: new Date(invoice.issueDate),
          dueDate: new Date(invoice.dueDate),
          items: invoice.services.map((service: any) => ({
            description: service.name || service.description,
            quantity: service.quantity || 1,
            rate: service.price || service.amount,
            amount: service.amount || service.price,
          })),
          subtotal: invoice.subtotal,
          tax: invoice.tax || 0,
          discount: invoice.discount || 0,
          total: invoice.total,
          notes: invoice.notes || '',
          status: 'paid',
        };

        const uploadResult = await createAndUploadInvoice(invoiceData);
        if (uploadResult.success) {
          await db.collection('invoices').updateOne(
            { _id: invoice._id },
            {
              $set: {
                s3Key: uploadResult.key,
                s3Url: uploadResult.url,
                s3UploadedAt: paidDate,
              },
            }
          );
          console.log(`✅ Stamped PAID PDF re-uploaded to S3 for invoice #${invoice.invoiceNumber}`);
        }
      } catch (pdfErr) {
        console.error('Failed to regenerate PAID invoice PDF:', pdfErr);
      }

      // C. Update Linked Project (Milestone, Budget, Activity Log)
      if (invoice.projectId && ObjectId.isValid(invoice.projectId)) {
        try {
          const project = await db.collection('projects').findOne({ _id: new ObjectId(invoice.projectId) });
          if (project) {
            const updatedMilestones = (project.milestones || []).map((m: any) => {
              if (m.paymentStatus !== 'paid' && (m.name === invoice.projectName || (m.amount && Math.abs(m.amount - totalAmount) < 1))) {
                return {
                  ...m,
                  paymentStatus: 'paid',
                  paidAt: paidDate,
                  paidAmount: m.amount || totalAmount,
                  status: m.status === 'pending' ? 'in-progress' : m.status,
                };
              }
              return m;
            });

            await db.collection('projects').updateOne(
              { _id: new ObjectId(invoice.projectId) },
              {
                $inc: { totalPaid: totalAmount },
                $set: {
                  milestones: updatedMilestones,
                  updatedAt: paidDate,
                },
                $push: {
                  activityLog: {
                    id: crypto.randomBytes(8).toString('hex'),
                    title: 'Invoice Paid',
                    description: `Invoice #${invoice.invoiceNumber} of ₹${totalAmount.toLocaleString('en-IN')} was paid via Razorpay.`,
                    date: paidDate.toISOString(),
                    type: 'payment',
                  },
                } as any,
              }
            );
            console.log(`✅ Project ${project.projectName} updated with payment of ₹${totalAmount}`);
          }
        } catch (projErr) {
          console.error('Failed to update linked project on invoice payment:', projErr);
        }
      }

      // D. Double-Entry Accounting Ledgers & Cashflow
      try {
        await FinanceDB.ensureSystemAccounts();
        const accounts = await FinanceDB.getAccounts();

        const paymentAccount = accounts.find(a => a.subType === 'Bank') || accounts.find(a => a.name === 'Cash in Hand');
        const receivableAccount = accounts.find(a => a.subType === 'Receivable') || accounts.find(a => a.type === 'Asset');

        if (paymentAccount && receivableAccount) {
          await FinanceDB.createJournalEntry([
            {
              accountId: paymentAccount._id!,
              type: 'Debit',
              amount: totalAmount,
              currency: 'INR',
              date: paidDate,
              description: `Razorpay Payment: Invoice #${invoice.invoiceNumber} from ${invoice.clientName}`,
              referenceId: invoice._id.toString(),
              referenceType: 'Payment',
            },
            {
              accountId: receivableAccount._id!,
              type: 'Credit',
              amount: totalAmount,
              currency: 'INR',
              date: paidDate,
              description: `Settle Receivable: Invoice #${invoice.invoiceNumber} from ${invoice.clientName}`,
              referenceId: invoice._id.toString(),
              referenceType: 'Payment',
            },
          ]);
        }

        // Record in cashflow
        await db.collection('cashflow').insertOne({
          type: 'inflow',
          category: 'Client Payment',
          amount: totalAmount,
          accountType: 'bank',
          paymentMethod: 'razorpay',
          bankName: 'Razorpay',
          reference: `Invoice #${invoice.invoiceNumber}`,
          description: `Payment received from ${invoice.clientName} for Invoice #${invoice.invoiceNumber}`,
          transactionDate: paidDate,
          clientId: invoice.clientId,
          clientName: invoice.clientName,
          invoiceId: invoice._id.toString(),
          invoiceNumber: invoice.invoiceNumber,
          createdAt: paidDate,
        });

        // Update Client's totalRevenue in clients collection
        if (invoice.clientId && ObjectId.isValid(invoice.clientId)) {
          await db.collection('clients').updateOne(
            { _id: new ObjectId(invoice.clientId) },
            { $inc: { totalRevenue: totalAmount, totalSpent: totalAmount } }
          );
        }
      } catch (financeErr) {
        console.error('Failed to update double-entry accounting ledger:', financeErr);
      }

      // E. Insert Payment Record into payments collection (Triggers CRM Admin Bell Notification!)
      try {
        await db.collection('payments').insertOne({
          invoiceId: invoice._id.toString(),
          invoiceNumber: invoice.invoiceNumber,
          clientId: invoice.clientId,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          projectId: invoice.projectId,
          projectName: invoice.projectName || 'Project',
          amount: totalAmount,
          paymentMethod: 'razorpay',
          paymentDate: paidDate,
          status: 'SUCCESS',
          type: 'invoice',
          description: `Invoice #${invoice.invoiceNumber}`,
          razorpayPaymentId: paymentId,
          createdAt: paidDate,
        });
      } catch (payRecordErr) {
        console.error('Failed to insert payments record:', payRecordErr);
      }

      // F. Send Payment Confirmation Email to Client
      try {
        await sendPaymentConfirmationEmail(
          invoice.clientEmail,
          invoice.clientName,
          totalAmount,
          `Razorpay (ID: ${paymentId})`,
          paidDate
        );
      } catch (emailErr) {
        console.error('Failed to send payment confirmation email:', emailErr);
      }

      return NextResponse.json({ success: true, message: 'Payment processed and settled successfully' });
    }

    // 2. Handle Payment Failed
    if (eventType === 'payment.failed') {
      const paymentEntity = event.payload?.payment?.entity;
      const invoiceId = paymentEntity?.notes?.invoiceId;

      console.warn('❌ Razorpay Payment Failed:', {
        paymentId: paymentEntity?.id,
        invoiceId,
        errorCode: paymentEntity?.error_code,
        errorDesc: paymentEntity?.error_description,
      });

      // Log failure in payments collection for admin visibility
      await db.collection('payments').insertOne({
        invoiceId: invoiceId || null,
        amount: paymentEntity?.amount ? paymentEntity.amount / 100 : 0,
        paymentMethod: 'razorpay',
        paymentDate: new Date(),
        status: 'FAILED',
        errorDetails: paymentEntity?.error_description || 'Payment failed',
        razorpayPaymentId: paymentEntity?.id,
        createdAt: new Date(),
      });

      return NextResponse.json({ success: true, message: 'Payment failure logged' });
    }

    return NextResponse.json({ success: true, message: 'Event acknowledged' });
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}

