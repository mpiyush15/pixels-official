import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import crypto from 'crypto';
import { sendContractAcceptanceEmail } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Find project by token
    const project = await db.collection('projects').findOne({ proposalToken: token });

    if (!project) {
      return NextResponse.json({ error: 'Proposal not found or already accepted' }, { status: 404 });
    }

    // Expose complete data needed for the unified contract & report viewer
    const publicProjectData = {
      _id: project._id,
      projectName: project.projectName,
      projectType: project.projectType || 'Project',
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      budget: project.budget,
      description: project.description,
      projectReport: project.projectReport || project.description || '',
      agreementText: project.agreementText || 'Standard terms and conditions apply.',
      milestones: project.milestones || [],
      tasks: project.tasks || [],
      phases: project.phases || [],
      videos: project.videos || [],
      createdAt: project.createdAt,
      contractAccepted: project.contractAccepted,
      contractAcceptedAt: project.contractAcceptedAt,
    };

    return NextResponse.json({ success: true, project: publicProjectData });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposal' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Find project by token
    const project = await db.collection('projects').findOne({ proposalToken: token });

    if (!project) {
      return NextResponse.json({ error: 'Proposal not found or already accepted' }, { status: 404 });
    }

    const now = new Date();
    
    // Update project with contract acceptance
    const result = await db.collection('projects').updateOne(
      { proposalToken: token },
      {
        $set: {
          contractAccepted: true,
          contractAcceptedAt: now,
          status: 'active',
          updatedAt: now,
        },
        $push: {
          activityLog: {
            id: crypto.randomBytes(8).toString('hex'),
            title: 'Contract Accepted',
            description: `Client (${project.clientEmail || 'Client'}) reviewed and accepted the project proposal, project report, and contract terms.`,
            date: now.toISOString(),
            type: 'contract',
          },
        } as any,
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to accept contract - no changes made' },
        { status: 500 }
      );
    }

    // 📄 Dispatch official signed contract acceptance email to client
    if (project.clientEmail) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pixelsdigitalsolutions.com';
        const downloadUrl = `${baseUrl}/contract/${token}`;

        await sendContractAcceptanceEmail(
          project.clientEmail,
          project.clientName || 'Valued Client',
          project.projectName,
          project.projectType || 'Project',
          {
            budget: project.budget,
            description: project.description || project.projectReport,
            milestones: project.milestones || [],
            acceptedAt: now,
            downloadUrl,
          }
        );
        console.log(`✅ Signed contract acceptance email sent to ${project.clientEmail}`);
      } catch (emailErr) {
        console.error('Error sending contract acceptance email:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Contract accepted successfully',
    });
  } catch (error) {
    console.error('Contract acceptance error:', error);
    return NextResponse.json(
      { error: 'Failed to accept contract' },
      { status: 500 }
    );
  }
}
