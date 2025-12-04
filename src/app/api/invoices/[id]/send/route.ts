import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createAndUploadInvoice } from '@/lib/invoiceGenerator';
import { sendInvoiceEmail, sendPaymentConfirmationEmail } from '@/lib/email';
import { getPresignedDownloadUrl } from '@/lib/s3';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(id) });

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    if (!invoice.clientEmail) {
      return NextResponse.json({ success: false, error: 'Client has no email on record' }, { status: 400 });
    }

    // Ensure PDF exists in S3. If not, generate and upload.
    let s3Key = invoice.s3Key;
    if (!s3Key) {
      try {
        const invoiceData: any = {
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          clientCompany: invoice.clientCompany,
          clientAddress: invoice.clientAddress,
          invoiceDate: new Date(invoice.issueDate),
          dueDate: new Date(invoice.dueDate),
          items: invoice.services.map((service: any) => ({ description: service.name || service.description, quantity: service.quantity || 1, rate: service.price || service.amount, amount: service.amount || service.price })),
          subtotal: invoice.subtotal,
          tax: invoice.tax || 0,
          discount: invoice.discount || 0,
          total: invoice.total,
          notes: invoice.notes || '',
          status: invoice.status || 'sent',
        };

        const uploadResult = await createAndUploadInvoice(invoiceData);
        if (uploadResult.success) {
          s3Key = uploadResult.key;
          await db.collection('invoices').updateOne({ _id: new ObjectId(id) }, { $set: { s3Key: uploadResult.key, s3Url: uploadResult.url, s3UploadedAt: new Date() } });
        }
      } catch (err) {
        console.error('Error generating invoice PDF for send:', err);
      }
    }

    let invoiceUrl: string | undefined;
    if (s3Key) {
      try {
        invoiceUrl = await getPresignedDownloadUrl(s3Key, 604800); // 7 days
      } catch (err) {
        console.error('Error creating presigned URL:', err);
      }
    }

    // If invoice is paid, send payment confirmation; otherwise send invoice email
    if (invoice.status === 'paid') {
      try {
        await sendPaymentConfirmationEmail(invoice.clientEmail, invoice.clientName, invoice.total, invoice.paymentDetails || 'N/A', new Date(invoice.paidAt || Date.now()));
      } catch (err) {
        console.error('Error sending payment confirmation email:', err);
        return NextResponse.json({ success: false, error: 'Failed to send payment confirmation email' }, { status: 500 });
      }
    } else {
      try {
        await sendInvoiceEmail(
          invoice.clientEmail,
          invoice.clientName,
          invoice.invoiceNumber,
          invoice.total,
          new Date(invoice.dueDate),
          invoice.services.map((s: any) => ({ description: s.name || s.description, amount: (s.quantity || 1) * (s.price || s.amount) })),
          invoiceUrl
        );
      } catch (err) {
        console.error('Error sending invoice email:', err);
        return NextResponse.json({ success: false, error: 'Failed to send invoice email' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send invoice route:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
