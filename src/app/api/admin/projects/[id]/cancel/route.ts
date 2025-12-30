import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';

// POST - Admin cancels project with reason
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    // Verify admin token
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins can cancel projects' },
        { status: 403 }
      );
    }

    const { reason, notes, cancelledBy } = await request.json();

    if (!reason) {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const project = await db.collection('projects').findOne({
      _id: new ObjectId(id),
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const cancellationDate = new Date();

    // Cancel the project
    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          cancelled: true,
          cancelledAt: cancellationDate,
          cancelledBy: cancelledBy || decoded.name || decoded.email,
          cancellationReason: reason,
          cancellationNotes: notes || '',
          status: 'cancelled',
          updatedAt: cancellationDate,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to cancel project' },
        { status: 500 }
      );
    }

    // Log cancellation activity
    await db.collection('activityLogs').insertOne({
      type: 'project_cancelled',
      projectId: new ObjectId(id),
      projectName: project.projectName,
      clientId: project.clientId,
      adminId: decoded.id || decoded.email,
      adminName: decoded.name || decoded.email,
      reason,
      notes,
      timestamp: cancellationDate,
      createdAt: cancellationDate,
    });

    console.log(`📋 Project ${project.projectName} cancelled by ${decoded.name || decoded.email}`);
    console.log(`   Reason: ${reason}`);
    if (notes) console.log(`   Notes: ${notes}`);

    return NextResponse.json({
      success: true,
      message: 'Project cancelled successfully',
      cancelledAt: cancellationDate,
    });
  } catch (error) {
    console.error('Error cancelling project:', error);
    return NextResponse.json(
      { error: 'Failed to cancel project' },
      { status: 500 }
    );
  }
}

// GET - Fetch cancellation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const project = await db.collection('projects').findOne({
      _id: new ObjectId(id),
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      cancelled: project.cancelled || false,
      cancelledAt: project.cancelledAt || null,
      cancelledBy: project.cancelledBy || null,
      cancellationReason: project.cancellationReason || null,
      cancellationNotes: project.cancellationNotes || null,
    });
  } catch (error) {
    console.error('Error fetching cancellation info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cancellation info' },
      { status: 500 }
    );
  }
}
