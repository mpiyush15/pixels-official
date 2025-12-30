import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// POST submit work for task (staff)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('staff-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const staffId = payload.staffId as string;

    const body = await request.json();
    const { notes, files } = body;

    console.log('📤 SUBMIT API - Received request:', {
      taskId: id,
      staffId,
      notesLength: notes?.length || 0,
      filesCount: files?.length || 0,
      files: files?.map((f: any) => ({ name: f.name, url: f.url, size: f.size })),
    });

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');
    const staffCollection = db.collection('staff');

    // Verify task belongs to this staff member
    const task = await tasksCollection.findOne({
      _id: new ObjectId(id),
      assignedTo: staffId,
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found or not assigned to you' },
        { status: 404 }
      );
    }

    // Get staff name
    const staff = await staffCollection.findOne({ _id: new ObjectId(staffId) });
    const staffName = staff?.name || 'Unknown Staff';

    // Calculate revision number
    const existingHistory = task.submissionHistory || [];
    const revisionNumber = existingHistory.length + 1;

    // Create submission entry for history
    const submissionEntry = {
      revisionNumber,
      submittedAt: new Date(),
      submittedBy: staffId,
      submittedByName: staffName,
      notes: notes || '',
      files: files || [],
      status: 'pending-review', // pending-review, approved, revision-requested
    };

    console.log('💾 Creating submission entry:', {
      revisionNumber,
      staffName,
      filesCount: submissionEntry.files.length,
      files: submissionEntry.files.map((f: any) => f.name),
    });

    const updates: any = {
      status: 'submitted',
      submissionNotes: notes || '',
      files: files || [],
      submittedDate: new Date(),
      updatedAt: new Date(),
    };

    // Set completed date if not already set
    if (!task.completedDate) {
      updates.completedDate = new Date();
    }

    // Push to submission history
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: updates,
        $push: { submissionHistory: submissionEntry } as any
      }
    );

    console.log('✅ SUBMIT API - Task updated:', {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      submissionHistoryLength: existingHistory.length + 1,
    });

    return NextResponse.json({ 
      success: true,
      revisionNumber,
      filesCount: files?.length || 0,
    });
  } catch (error: any) {
    console.error('Error submitting task:', error);
    return NextResponse.json(
      { error: 'Failed to submit task' },
      { status: 500 }
    );
  }
}
