import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Get all quotations or filter by client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    const db = await getDatabase();
    const query = clientId ? { clientId: new ObjectId(clientId) } : {};
    
    const quotations = await db
      .collection('quotations')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Populate client names
    const quotationsWithClients = await Promise.all(
      quotations.map(async (quotation) => {
        const client = await db.collection('clients').findOne({
          _id: new ObjectId(quotation.clientId),
        });
        return {
          ...quotation,
          clientSalutation: client?.salutation || '',
          clientName: client?.name || 'Unknown',
          clientEmail: client?.email || '',
        };
      })
    );

    return NextResponse.json({
      success: true,
      quotations: quotationsWithClients
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotations' },
      { status: 500 }
    );
  }
}

// POST - Create new quotation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientId,
      quotationNumber,
      title,
      description,
      items,
      subtotal,
      tax,
      discount,
      total,
      validUntil,
      terms,
      notes,
    } = body;

    // Validation
    if (!clientId || !title || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if client exists
    const client = await db.collection('clients').findOne({
      _id: new ObjectId(clientId),
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Generate quotation number if not provided
    // Format: QT-YYMMDD-XXX (e.g., QT-260102-001)
    let generatedQuotationNumber = quotationNumber;
    if (!generatedQuotationNumber) {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      generatedQuotationNumber = `QT-${year}${month}${day}-${random}`;
    }

    const quotation = {
      clientId: new ObjectId(clientId),
      quotationNumber: generatedQuotationNumber,
      title,
      description: description || '',
      items: items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity || 1,
        rate: item.rate || 0,
        amount: item.amount || 0,
      })),
      subtotal: subtotal || 0,
      tax: tax || 0,
      discount: discount || 0,
      total: total || 0,
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      terms: terms || '',
      notes: notes || '',
      status: 'pending', // pending, accepted, rejected, expired
      createdAt: new Date(),
      updatedAt: new Date(),
      acceptedAt: null,
      rejectedAt: null,
      rejectionReason: null,
    };

    const result = await db.collection('quotations').insertOne(quotation);

    console.log('✅ Quotation created:', generatedQuotationNumber);

    return NextResponse.json(
      {
        success: true,
        quotationId: result.insertedId,
        quotationNumber: generatedQuotationNumber,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating quotation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create quotation' },
      { status: 500 }
    );
  }
}
