import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createAndUploadInvoice } from '@/lib/invoiceGenerator';
import { getPresignedDownloadUrl } from '@/lib/s3';

export async function GET() {
  try {
    const db = await getDatabase();
    const invoices = await db
      .collection('invoices')
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    // Add presigned URLs for invoices that have S3 keys
    const invoicesWithUrls = await Promise.all(
      invoices.map(async (invoice) => {
        if (invoice.s3Key) {
          try {
            const url = await getPresignedDownloadUrl(invoice.s3Key, 3600); // 1 hour
            return { ...invoice, s3Url: url };
          } catch (error) {
            console.error('Error generating presigned URL:', error);
            return invoice;
          }
        }
        return invoice;
      })
    );

    return NextResponse.json(invoicesWithUrls);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    // Generate invoice number
    const count = await db.collection('invoices').countDocuments();
    const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;

    const invoice = {
      invoiceNumber,
      clientId: body.clientId,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone || '',
      clientCompany: body.clientCompany || '',
      clientAddress: body.clientAddress || '',
      services: body.services,
      subtotal: body.subtotal,
      tax: body.tax,
      total: body.total,
      status: 'draft',
      issueDate: body.issueDate,
      dueDate: body.dueDate,
      createdAt: new Date(),
    };

    const result = await db.collection('invoices').insertOne(invoice);

    // Generate and upload invoice to S3
    try {
      const invoiceData = {
        invoiceNumber,
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        clientCompany: body.clientCompany,
        clientAddress: body.clientAddress,
        invoiceDate: new Date(body.issueDate),
        dueDate: new Date(body.dueDate),
        items: body.services.map((service: any) => ({
          description: service.name || service.description,
          quantity: service.quantity || 1,
          rate: service.price || service.amount,
          amount: service.amount || service.price,
        })),
        subtotal: body.subtotal,
        tax: body.tax,
        discount: body.discount || 0,
        total: body.total,
        notes: body.notes || '',
        status: 'draft' as const,
      };

      const uploadResult = await createAndUploadInvoice(invoiceData);

      if (uploadResult.success) {
        // Update invoice with S3 info
        await db.collection('invoices').updateOne(
          { _id: result.insertedId },
          {
            $set: {
              s3Key: uploadResult.key,
              s3Url: uploadResult.url,
              s3UploadedAt: new Date(),
            },
          }
        );
        console.log('Invoice uploaded to S3:', uploadResult.key);
      } else {
        console.error('Failed to upload invoice to S3:', uploadResult.error);
      }
    } catch (s3Error) {
      console.error('S3 upload error:', s3Error);
      // Continue even if S3 upload fails
    }

    // Only increment project count, not revenue (revenue added when invoice is paid)
    await db.collection('clients').updateOne(
      { _id: new ObjectId(body.clientId) },
      { 
        $inc: { 
          projectsCount: 1
        }
      }
    );

    return NextResponse.json({
      success: true,
      invoiceId: result.insertedId,
      invoiceNumber,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
