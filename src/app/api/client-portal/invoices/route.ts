import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getPresignedDownloadUrl } from '@/lib/s3';

export async function GET(request: NextRequest) {
  try {
    const clientId = request.cookies.get('client-session')?.value;

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const invoices = await db
      .collection('invoices')
      .find({ clientId })
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
    console.error('Error fetching client invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
