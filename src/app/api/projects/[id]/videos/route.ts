import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Add new video to project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();

    const video = {
      _id: new ObjectId().toString(),
      title: body.title,
      description: body.description || '',
      driveLink: body.driveLink || '',
      amount: body.amount || 0,
      status: body.status || 'pending', // pending, in-progress, completed
      paymentStatus: body.paymentStatus || 'unpaid', // unpaid, paid
      invoiceId: body.invoiceId || null,
      completedDate: body.completedDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { videos: video } as any,
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error('Error adding video:', error);
    return NextResponse.json(
      { error: 'Failed to add video' },
      { status: 500 }
    );
  }
}

// Update existing video
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { videoId, ...updates } = body;
    const db = await getDatabase();

    const updateFields: any = {
      'videos.$.updatedAt': new Date(),
      updatedAt: new Date(),
    };

    if (updates.title !== undefined) updateFields['videos.$.title'] = updates.title;
    if (updates.description !== undefined) updateFields['videos.$.description'] = updates.description;
    if (updates.driveLink !== undefined) updateFields['videos.$.driveLink'] = updates.driveLink;
    if (updates.amount !== undefined) updateFields['videos.$.amount'] = updates.amount;
    if (updates.status !== undefined) updateFields['videos.$.status'] = updates.status;
    if (updates.paymentStatus !== undefined) updateFields['videos.$.paymentStatus'] = updates.paymentStatus;
    if (updates.invoiceId !== undefined) updateFields['videos.$.invoiceId'] = updates.invoiceId;
    if (updates.completedDate !== undefined) updateFields['videos.$.completedDate'] = updates.completedDate;

    await db.collection('projects').updateOne(
      {
        _id: new ObjectId(id),
        'videos._id': videoId,
      },
      {
        $set: updateFields,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    );
  }
}

// Delete video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: { videos: { _id: videoId } } as any,
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
