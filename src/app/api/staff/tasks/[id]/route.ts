import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// GET single task by ID (staff)
export async function GET(
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

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');

    // Fetch the task and verify it belongs to this staff member
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

    // Format task with all data
    const formattedTask = {
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      projectName: task.projectName,
      clientName: task.clientName,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      startDate: task.startDate,
      completedDate: task.completedDate,
      submittedDate: task.submittedDate,
      files: task.files || [],
      submissionNotes: task.submissionNotes,
      adminNotes: task.adminNotes,
      revisionReason: task.revisionReason,
      createdAt: task.createdAt,
      submissionHistory: task.submissionHistory || [], // CRITICAL: Return full submission history
    };

    console.log('✅ Staff Task API - Returning task:', {
      taskId: formattedTask._id,
      title: formattedTask.title,
      filesCount: formattedTask.files.length,
      submissionHistoryCount: formattedTask.submissionHistory.length,
    });

    // Log submission history details for debugging
    if (formattedTask.submissionHistory.length > 0) {
      console.log('📋 Submission History Details:');
      formattedTask.submissionHistory.forEach((sub: any, idx: number) => {
        console.log(`  Revision #${sub.revisionNumber}:`, {
          filesCount: sub.files?.length || 0,
          status: sub.status,
          submittedAt: sub.submittedAt,
        });
      });
    }

    return NextResponse.json({ task: formattedTask });
  } catch (error: any) {
    console.error('❌ Error fetching staff task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}
