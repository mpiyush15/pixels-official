import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// GET all tasks (admin view)
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await jwtVerify(token, secret);

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const staffId = searchParams.get('staffId');
    const clientId = searchParams.get('clientId');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    // If taskId is provided, return single task
    if (taskId) {
      const task = await tasksCollection.findOne({ _id: new ObjectId(taskId) });
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json([{ ...task, _id: task._id.toString() }]);
    }

    // Build filter query
    const filter: any = {};
    if (staffId) filter.assignedTo = staffId;
    if (clientId) filter.clientId = clientId;
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;

    const tasks = await tasksCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      tasks.map((task) => ({ ...task, _id: task._id.toString() }))
    );
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST create new task (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const adminId = payload.userId as string;
    const adminName = payload.name as string;

    const body = await request.json();
    const {
      title,
      description,
      projectId,
      projectName,
      clientId,
      clientName,
      assignedTo,
      assignedToName,
      assignedToRole,
      priority,
      dueDate,
    } = body;

    // Validate required fields
    if (!title || !clientId || !assignedTo || !dueDate || !priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');

    const newTask = {
      title,
      description: description || '',
      projectId: projectId || null,
      projectName: projectName || null,
      clientId,
      clientName,
      assignedTo,
      assignedToName,
      assignedToRole,
      status: 'assigned' as const,
      priority,
      dueDate,
      startDate: null,
      completedDate: null,
      submittedDate: null,
      approvedDate: null,
      files: [],
      submissionNotes: null,
      adminNotes: null,
      revisionReason: null,
      createdBy: adminId,
      createdByName: adminName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await tasksCollection.insertOne(newTask);

    return NextResponse.json(
      {
        success: true,
        task: { ...newTask, _id: result.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PATCH update task
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await jwtVerify(token, secret);

    const body = await request.json();
    const { taskId, updates } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');

    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(taskId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await jwtVerify(token, secret);

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');

    const result = await tasksCollection.deleteOne({ _id: new ObjectId(taskId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
