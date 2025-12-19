import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const tasks = await db.collection('schedule_tasks')
      .find({})
      .sort({ date: 1 })
      .toArray();

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const task = {
      title: body.title,
      description: body.description || '',
      date: body.date,
      time: body.time || '',
      projectId: body.projectId || null,
      projectName: body.projectName || null,
      clientName: body.clientName || null,
      status: body.status || 'pending',
      type: body.type || 'task',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('schedule_tasks').insertOne(task);

    return NextResponse.json({
      success: true,
      task: { ...task, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
