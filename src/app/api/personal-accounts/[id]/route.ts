import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.type) updateData.type = body.type;
    if (body.category) updateData.category = body.category;
    if (body.amount) updateData.amount = parseFloat(body.amount);
    if (body.date) updateData.date = body.date;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.paymentMethod) updateData.paymentMethod = body.paymentMethod;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const result = await db.collection('personal_accounts').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully',
    });
  } catch (error) {
    console.error('Error updating personal transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update personal transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();

    const result = await db.collection('personal_accounts').deleteOne({
      _id: new ObjectId(params.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting personal transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete personal transaction' },
      { status: 500 }
    );
  }
}
