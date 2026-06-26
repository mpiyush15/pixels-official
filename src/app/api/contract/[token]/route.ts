import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

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

    // Don't expose sensitive fields, just what is needed for the contract page
    const publicProjectData = {
      _id: project._id,
      projectName: project.projectName,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      budget: project.budget,
      description: project.description,
      milestones: project.milestones || [],
      tasks: project.tasks || [],
      phases: project.phases || [],
      videos: project.videos || [],
      createdAt: project.createdAt,
      contractAccepted: project.contractAccepted,
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
