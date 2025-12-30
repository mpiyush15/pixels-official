import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { sendContractAcceptanceEmail } from '@/lib/email';
import { ObjectId } from 'mongodb';

// GET contract
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
      contractContent: project.contractContent || '',
      contractAccepted: project.contractAccepted || false,
      contractAcceptedAt: project.contractAcceptedAt || null,
      contractAcceptedBy: project.contractAcceptedBy || null,
      canModifyUntil: project.canModifyUntil || null,
      contractLocked: project.contractLocked || false,
    });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500 }
    );
  }
}

// POST - Admin creates/updates contract content
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { contractContent } = await request.json();
    const db = await getDatabase();

    if (!contractContent) {
      return NextResponse.json(
        { error: 'Contract content is required' },
        { status: 400 }
      );
    }

    const project = await db.collection('projects').findOne({
      _id: new ObjectId(id),
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // If contract already accepted, don't allow changes
    if (project.contractAccepted) {
      return NextResponse.json(
        { error: 'Contract already accepted by client. Cannot modify.' },
        { status: 403 }
      );
    }

    await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          contractContent,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Contract content updated successfully',
    });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    );
  }
}

// PUT - Client accepts contract (locked for 1 year)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { clientId, clientName, accepted } = await request.json();
    const db = await getDatabase();

    if (!clientId || typeof accepted !== 'boolean') {
      return NextResponse.json(
        { error: 'clientId and accepted boolean are required' },
        { status: 400 }
      );
    }

    const project = await db.collection('projects').findOne({
      _id: new ObjectId(id),
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.clientId !== clientId && project.clientId !== new ObjectId(clientId).toString()) {
      return NextResponse.json(
        { error: 'Unauthorized: This is not your project' },
        { status: 403 }
      );
    }

    if (!accepted) {
      return NextResponse.json(
        { error: 'Client must accept the contract to proceed' },
        { status: 400 }
      );
    }

    // Lock contract for 1 year from acceptance
    const now = new Date();
    const lockedUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          contractAccepted: true,
          contractAcceptedAt: now,
          contractAcceptedBy: clientName || clientId,
          canModifyUntil: lockedUntil,
          contractLocked: true,
          status: 'in-progress', // Auto-start project after contract acceptance
          updatedAt: now,
        },
      }
    );

    // Send confirmation email to client
    try {
      // Get client email from database
      const client = await db.collection('clients').findOne({
        _id: new ObjectId(clientId)
      });

      if (client && client.email) {
        console.log('Sending contract acceptance email to:', client.email);
        const emailResult = await sendContractAcceptanceEmail(
          client.email,
          client.name || clientName || 'Client',
          project.projectName || 'Project',
          project.projectType || 'Web Development'
        );

        console.log('Email result:', emailResult);
        if (!emailResult.success) {
          console.error('Email sending failed:', emailResult.error);
          // Don't fail the API request if email fails - contract is already accepted
        } else {
          console.log('Email sent successfully:', emailResult.messageId);
        }
      } else {
        console.log('Client not found or no email:', { client, clientId });
      }
    } catch (emailError) {
      console.error('Error sending contract acceptance email:', emailError);
      // Don't fail the API request if email fails - contract is already accepted
    }

    return NextResponse.json({
      success: true,
      message: 'Contract accepted successfully. Project started!',
      lockedUntil,
    });
  } catch (error) {
    console.error('Error accepting contract:', error);
    return NextResponse.json(
      { error: 'Failed to accept contract' },
      { status: 500 }
    );
  }
}
