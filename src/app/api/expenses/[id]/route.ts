import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();

    // Get the old expense to check if amount or vendorId changed
    const oldExpense = await db.collection('expenses').findOne({ _id: new ObjectId(id) });

    const updateData = {
      ...body,
      amount: parseFloat(body.amount),
      updatedAt: new Date(),
    };

    await db.collection('expenses').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Update vendor totalPaid if needed
    if (oldExpense) {
      const oldAmount = oldExpense.paymentStatus === 'paid' ? oldExpense.amount : 0;
      const newAmount = body.paymentStatus === 'paid' ? parseFloat(body.amount) : 0;
      const amountDiff = newAmount - oldAmount;

      if (body.vendorId && amountDiff !== 0) {
        await db.collection('vendors').updateOne(
          { _id: new ObjectId(body.vendorId) },
          { 
            $inc: { totalPaid: amountDiff },
            $set: { updatedAt: new Date() }
          }
        );
      } else if (oldExpense.vendorId && oldExpense.vendorId !== body.vendorId) {
        // Vendor changed, update both old and new
        if (oldAmount > 0) {
          await db.collection('vendors').updateOne(
            { _id: new ObjectId(oldExpense.vendorId) },
            { 
              $inc: { totalPaid: -oldAmount },
              $set: { updatedAt: new Date() }
            }
          );
        }
        if (body.vendorId && newAmount > 0) {
          await db.collection('vendors').updateOne(
            { _id: new ObjectId(body.vendorId) },
            { 
              $inc: { totalPaid: newAmount },
              $set: { updatedAt: new Date() }
            }
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    // Get expense to update vendor totalPaid before deletion
    const expense = await db.collection('expenses').findOne({ _id: new ObjectId(id) });

    await db.collection('expenses').deleteOne({
      _id: new ObjectId(id),
    });

    // Update vendor totalPaid if expense was paid
    if (expense && expense.vendorId && expense.paymentStatus === 'paid') {
      await db.collection('vendors').updateOne(
        { _id: new ObjectId(expense.vendorId) },
        { 
          $inc: { totalPaid: -expense.amount },
          $set: { updatedAt: new Date() }
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
