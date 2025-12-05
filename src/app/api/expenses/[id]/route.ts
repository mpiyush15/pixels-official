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

      // Handle cash flow entries based on payment status change
      if (oldExpense.paymentStatus !== 'paid' && body.paymentStatus === 'paid') {
        // Changed from pending/overdue to paid - Create cash flow entry
        const accountType = body.paymentMethod === 'cash' ? 'cash' : 'bank';
        
        const cashFlowEntry = {
          type: 'expense',
          category: 'expense',
          amount: parseFloat(body.amount),
          accountType: accountType,
          paymentMethod: body.paymentMethod,
          reference: body.invoiceNumber || `Expense #${id}`,
          description: `${body.category} - ${body.description}`,
          transactionDate: new Date(body.date),
          vendorId: body.vendorId,
          vendorName: body.vendorName,
          expenseId: id,
          expenseCategory: body.category,
          createdAt: new Date(),
        };

        await db.collection('cashflow').insertOne(cashFlowEntry);
      } else if (oldExpense.paymentStatus === 'paid' && body.paymentStatus !== 'paid') {
        // Changed from paid to pending/overdue - Remove cash flow entry
        await db.collection('cashflow').deleteOne({ expenseId: id });
      } else if (oldExpense.paymentStatus === 'paid' && body.paymentStatus === 'paid') {
        // Still paid but details changed - Update cash flow entry
        const accountType = body.paymentMethod === 'cash' ? 'cash' : 'bank';
        
        await db.collection('cashflow').updateOne(
          { expenseId: id },
          {
            $set: {
              amount: parseFloat(body.amount),
              accountType: accountType,
              paymentMethod: body.paymentMethod,
              reference: body.invoiceNumber || `Expense #${id}`,
              description: `${body.category} - ${body.description}`,
              transactionDate: new Date(body.date),
              vendorId: body.vendorId,
              vendorName: body.vendorName,
              expenseCategory: body.category,
              updatedAt: new Date(),
            }
          }
        );
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

    // Delete associated cash flow entry
    if (expense && expense.paymentStatus === 'paid') {
      await db.collection('cashflow').deleteOne({ expenseId: id });
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
