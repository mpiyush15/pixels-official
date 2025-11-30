import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Add daily update to a phase
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  try {
    const { id, phaseId } = await params;
    const body = await request.json();
    const db = await getDatabase();

    const update = {
      _id: new ObjectId().toString(),
      description: body.description,
      date: body.date || new Date().toISOString().split('T')[0],
      timestamp: new Date(),
    };

    await db.collection('projects').updateOne(
      {
        _id: new ObjectId(id),
        'phases._id': phaseId,
      },
      {
        $push: { 'phases.$.dailyUpdates': update } as any,
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({ success: true, update });
  } catch (error) {
    console.error('Error adding daily update:', error);
    return NextResponse.json(
      { error: 'Failed to add daily update' },
      { status: 500 }
    );
  }
}

// Delete daily update
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  try {
    const { id, phaseId } = await params;
    const { searchParams } = new URL(request.url);
    const updateId = searchParams.get('updateId');

    if (!updateId) {
      return NextResponse.json(
        { error: 'Update ID required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    await db.collection('projects').updateOne(
      {
        _id: new ObjectId(id),
        'phases._id': phaseId,
      },
      {
        $pull: { 'phases.$.dailyUpdates': { _id: updateId } } as any,
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting update:', error);
    return NextResponse.json(
      { error: 'Failed to delete update' },
      { status: 500 }
    );
  }
}
