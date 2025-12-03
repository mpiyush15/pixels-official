import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Delete work submission (client only deletes their own)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = request.cookies.get('client-session')?.value;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();

    // Verify the submission belongs to this client
    const submission = await db.collection('workSubmissions').findOne({
      _id: new ObjectId(id),
      clientId: clientId,
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the submission
    await db.collection('workSubmissions').deleteOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting work submission:', error);
    return NextResponse.json(
      { error: 'Failed to delete work submission' },
      { status: 500 }
    );
  }
}
