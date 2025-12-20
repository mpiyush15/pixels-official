import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// GET tasks assigned to staff member
export async function GET(request: NextRequest) {
  try {
    // Verify staff authentication
    const token = request.cookies.get('staff-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const staffId = payload.staffId as string;

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build filter query
    const filter: any = { assignedTo: staffId };
    if (status) filter.status = status;

    const tasks = await tasksCollection
      .find(filter)
      .sort({ dueDate: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json(
      tasks.map((task) => ({ ...task, _id: task._id.toString() }))
    );
  } catch (error: any) {
    console.error('Error fetching staff tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
