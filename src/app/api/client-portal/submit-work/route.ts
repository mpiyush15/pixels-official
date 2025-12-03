import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const clientId = request.cookies.get('client-session')?.value;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, workType, fileUrl, fileName, fileKey, fileSize, notes } = body;

    if (!title || !description || !workType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Get client info
    const client = await db.collection('clients').findOne({
      _id: new ObjectId(clientId),
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Create work submission
    const submission = {
      clientId,
      clientName: client.name,
      clientEmail: client.email,
      title,
      description,
      workType,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileKey: fileKey || null,
      fileSize: fileSize || null,
      notes: notes || null,
      status: 'pending', // pending, reviewed, approved, needs-revision
      submittedAt: new Date(),
      createdAt: new Date(),
    };

    const result = await db.collection('workSubmissions').insertOne(submission);

    return NextResponse.json({
      success: true,
      submissionId: result.insertedId,
    });
  } catch (error) {
    console.error('Error submitting work:', error);
    return NextResponse.json(
      { error: 'Failed to submit work' },
      { status: 500 }
    );
  }
}

// Get all work submissions for authenticated client
export async function GET(request: NextRequest) {
  try {
    const clientId = request.cookies.get('client-session')?.value;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();

    const submissions = await db
      .collection('workSubmissions')
      .find({ clientId })
      .sort({ submittedAt: -1 })
      .toArray();

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching work submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work submissions' },
      { status: 500 }
    );
  }
}
