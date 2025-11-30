import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const invoices = await db
      .collection('invoices')
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(invoices);
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

    // Update client's total revenue and project count
    await db.collection('clients').updateOne(
      { _id: new ObjectId(body.clientId) },
      { 
        $inc: { 
          totalRevenue: body.total,
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
