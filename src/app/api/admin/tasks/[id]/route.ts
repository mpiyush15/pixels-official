import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// GET single task by ID (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await jwtVerify(token, secret);

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');
    const staffCollection = db.collection('staff');
    const adminCollection = db.collection('admin');

    // Fetch the task
    const task = await tasksCollection.findOne({ _id: new ObjectId(id) });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get staff info
    let assignedToName = 'Unknown';
    let assignedToRole = 'Unknown';
    if (task.assignedTo) {
      const staff = await staffCollection.findOne({ _id: new ObjectId(task.assignedTo) });
      if (staff) {
        assignedToName = staff.name;
        assignedToRole = staff.role;
      }
    }

    // Get creator info
    let createdByName = 'Admin';
    if (task.createdBy) {
      const admin = await adminCollection.findOne({ _id: new ObjectId(task.createdBy) });
      if (admin) {
        createdByName = admin.email || 'Admin';
      }
    }

    // Format task with all data
    const formattedTask = {
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      projectName: task.projectName,
      clientName: task.clientName,
      assignedToName,
      assignedToRole,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      startDate: task.startDate,
      completedDate: task.completedDate,
      submittedDate: task.submittedDate,
      approvedDate: task.approvedDate,
      files: task.files || [], // Current/legacy files
      submissionNotes: task.submissionNotes,
      adminNotes: task.adminNotes,
      revisionReason: task.revisionReason,
      createdAt: task.createdAt,
      createdByName,
      submissionHistory: task.submissionHistory || [], // CRITICAL: Return full submission history
    };

    console.log('✅ Admin Task API - Returning task:', {
      taskId: formattedTask._id,
      title: formattedTask.title,
      filesCount: formattedTask.files.length,
      submissionHistoryCount: formattedTask.submissionHistory.length,
      hasSubmissionHistory: !!formattedTask.submissionHistory.length,
    });

    // Log submission history details for debugging
    if (formattedTask.submissionHistory.length > 0) {
      console.log('📋 Submission History Details:');
      formattedTask.submissionHistory.forEach((sub: any, idx: number) => {
        console.log(`  Revision #${sub.revisionNumber}:`, {
          filesCount: sub.files?.length || 0,
          status: sub.status,
          submittedAt: sub.submittedAt,
          submittedBy: sub.submittedByName,
        });
      });
    }

    return NextResponse.json({ task: formattedTask });
  } catch (error: any) {
    console.error('❌ Error fetching admin task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}
