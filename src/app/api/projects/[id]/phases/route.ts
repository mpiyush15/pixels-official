import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Add new phase to project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();

    const phase = {
      _id: new ObjectId().toString(),
      name: body.name,
      description: body.description || '',
      amount: body.amount || 0,
      status: body.status || 'locked', // locked, unlocked, in-progress, completed
      progress: body.progress || 0,
      paymentStatus: body.paymentStatus || 'unpaid', // unpaid, paid
      invoiceId: body.invoiceId || null,
      dailyUpdates: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { phases: phase } as any,
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({ success: true, phase });
  } catch (error) {
    console.error('Error adding phase:', error);
    return NextResponse.json(
      { error: 'Failed to add phase' },
      { status: 500 }
    );
  }
}

// Update existing phase
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { phaseId, ...updates } = body;
    const db = await getDatabase();

    await db.collection('projects').updateOne(
      { 
        _id: new ObjectId(id),
        'phases._id': phaseId 
      },
      {
        $set: {
          'phases.$.name': updates.name,
          'phases.$.description': updates.description,
          'phases.$.amount': updates.amount,
          'phases.$.status': updates.status,
          'phases.$.progress': updates.progress,
          'phases.$.paymentStatus': updates.paymentStatus,
          'phases.$.invoiceId': updates.invoiceId,
          'phases.$.updatedAt': new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating phase:', error);
    return NextResponse.json(
      { error: 'Failed to update phase' },
      { status: 500 }
    );
  }
}

// Delete phase
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const phaseId = searchParams.get('phaseId');

    if (!phaseId) {
      return NextResponse.json(
        { error: 'Phase ID required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: { phases: { _id: phaseId } } as any,
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting phase:', error);
    return NextResponse.json(
      { error: 'Failed to delete phase' },
      { status: 500 }
    );
  }
}
