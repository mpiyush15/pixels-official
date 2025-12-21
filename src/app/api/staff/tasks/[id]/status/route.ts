import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// PATCH update task status (staff)
export async function PATCH(
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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');

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

    const updates: any = {
      status,
      updatedAt: new Date(),
    };

    // Add date stamps based on status
    if (status === 'in-progress' && !task.startDate) {
      updates.startDate = new Date();
    } else if (status === 'completed' && !task.completedDate) {
      updates.completedDate = new Date();
    }

    await tasksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { error: 'Failed to update task status' },
      { status: 500 }
    );
  }
}
