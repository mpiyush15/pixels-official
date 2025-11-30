import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();

    const updateData: any = {};
    
    if (body.status) {
      updateData.status = body.status;
      
      // If marking as paid, add paid date and payment info
      if (body.status === 'paid') {
        updateData.paidAt = new Date();
        
        if (body.paymentMethod) {
          updateData.paymentMethod = body.paymentMethod;
        }
        
        if (body.paymentDetails) {
          updateData.paymentDetails = body.paymentDetails;
        }
      }
    }

    await db.collection('invoices').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    
    await db.collection('invoices').deleteOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
