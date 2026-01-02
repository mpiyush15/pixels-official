import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendQuotationEmail } from '@/lib/email';

// POST - Send quotation to client via email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const quotation = await db.collection('quotations').findOne({
      _id: new ObjectId(id),
    });

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Get client details
    const client = await db.collection('clients').findOne({
      _id: new ObjectId(quotation.clientId),
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!client.email) {
      return NextResponse.json(
        { error: 'Client has no email address' },
        { status: 400 }
      );
    }

    console.log(`📧 Sending quotation ${quotation.quotationNumber} to ${client.email}`);

    // Send quotation email
    const emailResult = await sendQuotationEmail(
      client.email,
      client.name,
      quotation.quotationNumber,
      quotation.title,
      quotation.items,
      quotation.total,
      quotation.validUntil
    );

    if (!emailResult.success) {
      console.error('Failed to send quotation email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

    // Update quotation with sent status
    await db.collection('quotations').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          sentAt: new Date(),
          status: quotation.status === 'draft' ? 'pending' : quotation.status,
          updatedAt: new Date(),
        },
      }
    );

    console.log(`✅ Quotation ${quotation.quotationNumber} sent successfully`);

    return NextResponse.json({
      success: true,
      message: 'Quotation sent successfully',
      clientEmail: client.email,
    });
  } catch (error: any) {
    console.error('Error sending quotation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send quotation' },
      { status: 500 }
    );
  }
}
