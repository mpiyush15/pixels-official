import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// POST submit work for task (staff)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('staff-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const staffId = payload.staffId as string;

    const body = await request.json();
    const { notes, files } = body;

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');

    // Verify task belongs to this staff member
    const task = await tasksCollection.findOne({
      _id: new ObjectId(params.id),
      assignedTo: staffId,
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found or not assigned to you' },
        { status: 404 }
      );
    }

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

    await tasksCollection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updates }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error submitting task:', error);
    return NextResponse.json(
      { error: 'Failed to submit task' },
      { status: 500 }
    );
  }
}
