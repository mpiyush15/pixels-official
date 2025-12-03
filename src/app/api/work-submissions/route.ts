import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getPresignedUploadUrl } from '@/lib/s3';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const clientAuth = cookieStore.get('client-session');

    if (!clientAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, fileName, fileType, fileSize, description } = await req.json();

    if (!projectId || !fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    if (fileSize && fileSize > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Get client info
    const clientId = clientAuth.value;
    const client = await clientPromise;
    const db = client.db('pixelsdigital');
    
    const clientDoc = await db.collection('clients').findOne({
      _id: new ObjectId(clientId),
    });

    if (!clientDoc) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if project exists and belongs to client
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId),
      clientId,
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if any milestone is locked (unpaid)
    const hasLockedMilestone = project.milestones?.some(
      (m: any) => m.amount && m.amount > 0 && m.paymentStatus !== 'paid'
    );

    if (hasLockedMilestone) {
      return NextResponse.json(
        { error: 'Please complete milestone payments before submitting work' },
        { status: 403 }
      );
    }

    // Generate unique file key for work submissions
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `work-submissions/${projectId}/${timestamp}-${sanitizedFileName}`;

    // Get presigned upload URL from S3
    const s3Result = await getPresignedUploadUrl(fileKey, fileType);
    
    if (!s3Result.success || !s3Result.uploadUrl) {
      return NextResponse.json(
        { error: s3Result.error || 'Failed to generate upload URL' },
        { status: 500 }
      );
    }

    const uploadUrl = s3Result.uploadUrl;
    const fileUrl = s3Result.downloadUrl!; // Use the presigned download URL from S3

    // Create submission record
    const submission = {
      clientId,
      clientName: clientDoc.name,
      clientEmail: clientDoc.email,
      fileKey,
      fileName,
      fileType,
      fileSize,
      fileUrl,
      description: description || '',
      submittedAt: new Date(),
      status: 'pending', // pending, approved, rejected
    };

    // Add submission to project
    await db.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $push: {
          workSubmissions: submission as any,
        },
      }
    );

    return NextResponse.json({
      success: true,
      uploadUrl,
      fileUrl,
      fileKey,
      fileName,
      message: 'Upload URL generated successfully',
    });
  } catch (error) {
    console.error('Error creating work submission:', error);
    return NextResponse.json(
      { error: 'Failed to create work submission' },
      { status: 500 }
    );
  }
}

// GET: Fetch work submissions for a project
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get('admin-token');
    const clientAuth = cookieStore.get('client-session');

    if (!adminAuth && !clientAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('pixelsdigital');

    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId),
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      submissions: project.workSubmissions || [],
    });
  } catch (error) {
    console.error('Error fetching work submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work submissions' },
      { status: 500 }
    );
  }
}
