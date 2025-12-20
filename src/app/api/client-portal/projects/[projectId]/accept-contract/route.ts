import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    console.log('Contract acceptance request for project:', projectId);
    
    // Get client ID from cookies
    const clientId = request.cookies.get('client-session')?.value;
    if (!clientId) {
      console.log('No client session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Accept Contract Debug');
    console.log('Project ID:', projectId);
    console.log('Session clientId:', clientId);
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('pixelsdigital');

    // First, let's see what the raw project looks like
    const rawProject = await db.collection('projects').findOne({
      _id: new ObjectId(projectId),
    });
    console.log('📄 Raw project:', JSON.stringify(rawProject, null, 2));

    // Get client info
    const clientDoc = await db.collection('clients').findOne({
      _id: new ObjectId(clientId),
    });

    if (!clientDoc) {
      console.log('❌ Client not found:', clientId);
      return NextResponse.json({ error: 'Client not found' }, { status: 401 });
    }

    console.log('✅ Client info:', { email: clientDoc.email, name: clientDoc.name });

    // Verify the project belongs to this client (check BOTH clientId and clientEmail for compatibility)
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId),
      $or: [
        { clientId: clientId }, // Match by clientId (preferred)
        { clientEmail: clientDoc.email }, // Match by email (fallback for old projects)
      ],
    });

    if (!project) {
      console.log('❌ Project not found for client:', clientDoc.email);
      console.log('🔍 Project clientEmail:', rawProject?.clientEmail);
      console.log('🔍 Project clientId:', rawProject?.clientId);
      return NextResponse.json({ error: 'Project not found or does not belong to this client' }, { status: 404 });
    }

    console.log('Project found:', project.projectName);

    // Update project with contract acceptance
    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          contractAccepted: true,
          contractAcceptedAt: new Date(),
          contractAcceptedBy: clientDoc.email,
        },
      }
    );

    console.log('Update result:', { modifiedCount: result.modifiedCount });

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to accept contract - no changes made' },
        { status: 500 }
      );
    }

    console.log('Contract accepted successfully');
    return NextResponse.json({
      success: true,
      message: 'Contract accepted successfully',
    });
  } catch (error) {
    console.error('Contract acceptance error:', error);
    return NextResponse.json(
      { error: 'Failed to accept contract: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
