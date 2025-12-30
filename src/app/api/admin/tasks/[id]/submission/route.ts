import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// PATCH update submission status in history (approve/request revision)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const adminId = payload.adminId as string;
    const adminEmail = payload.email as string;

    const body = await request.json();
    const { action, notes, revisionNumber } = body;

    if (!['approve', 'request-revision'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');
    const adminCollection = db.collection('admin');

    // Get admin name
    const admin = await adminCollection.findOne({ _id: new ObjectId(adminId) });
    const adminName = admin?.email || adminEmail;

    const task = await tasksCollection.findOne({ _id: new ObjectId(id) });
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const submissionHistory = task.submissionHistory || [];
    
    // Find the submission to update (latest if revisionNumber not provided)
    const targetRevision = revisionNumber || submissionHistory.length;
    const submissionIndex = submissionHistory.findIndex(
      (sub: any) => sub.revisionNumber === targetRevision
    );

    if (submissionIndex === -1) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Update the submission status
    const newStatus = action === 'approve' ? 'approved' : 'revision-requested';
    submissionHistory[submissionIndex].status = newStatus;
    submissionHistory[submissionIndex].adminNotes = notes || '';
    submissionHistory[submissionIndex].adminAction = {
      by: adminId,
      byName: adminName,
      at: new Date(),
    };

    // Update task
    const taskUpdates: any = {
      submissionHistory,
      adminNotes: notes || '',
      updatedAt: new Date(),
    };

    if (action === 'approve') {
      taskUpdates.status = 'approved';
      taskUpdates.approvedDate = new Date();
    } else {
      taskUpdates.status = 'revision-needed';
      taskUpdates.revisionReason = notes || '';
    }

    await tasksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: taskUpdates }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}
