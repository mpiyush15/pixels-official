import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendQuotationEmail } from '@/lib/email';

// GET - Get single quotation
export async function GET(
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

    return NextResponse.json({
      ...quotation,
      clientSalutation: client?.salutation || '',
      clientName: client?.name || 'Unknown',
      clientEmail: client?.email || '',
    });
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotation' },
      { status: 500 }
    );
  }
}

// PUT - Update quotation or accept/reject
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, ...updateData } = body;

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

    let update: any = {
      updatedAt: new Date(),
    };

    // Handle accept/reject actions
    if (action === 'accept') {
      update.status = 'accepted';
      update.acceptedAt = new Date();
      console.log(`✅ Quotation ${quotation.quotationNumber} accepted`);
    } else if (action === 'reject') {
      update.status = 'rejected';
      update.rejectedAt = new Date();
      update.rejectionReason = updateData.rejectionReason || 'Not specified';
      console.log(`❌ Quotation ${quotation.quotationNumber} rejected`);
    } else {
      // Regular update
      if (updateData.title) update.title = updateData.title;
      if (updateData.description !== undefined) update.description = updateData.description;
      if (updateData.items) update.items = updateData.items;
      if (updateData.subtotal !== undefined) update.subtotal = updateData.subtotal;
      if (updateData.tax !== undefined) update.tax = updateData.tax;
      if (updateData.discount !== undefined) update.discount = updateData.discount;
      if (updateData.total !== undefined) update.total = updateData.total;
      if (updateData.validUntil) update.validUntil = new Date(updateData.validUntil);
      if (updateData.terms !== undefined) update.terms = updateData.terms;
      if (updateData.notes !== undefined) update.notes = updateData.notes;
      if (updateData.status) update.status = updateData.status;
    }

    await db.collection('quotations').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    return NextResponse.json({
      success: true,
      message: 'Quotation updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating quotation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update quotation' },
      { status: 500 }
    );
  }
}

// DELETE - Delete quotation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const result = await db.collection('quotations').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    console.log('🗑️ Quotation deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Quotation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json(
      { error: 'Failed to delete quotation' },
      { status: 500 }
    );
  }
}
