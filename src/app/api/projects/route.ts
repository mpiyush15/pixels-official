import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Get all projects for a client OR all projects for admin
export async function GET(request: NextRequest) {
  try {
    const clientId = request.cookies.get('client-session')?.value;
    const isAdmin = request.cookies.get('admin-token')?.value; // Check if admin

    const db = await getDatabase();
    
    let projects;
    if (clientId && !isAdmin) {
      // Client view: only their projects
      projects = await db
        .collection('projects')
        .find({ clientId })
        .sort({ createdAt: -1 })
        .toArray();
    } else {
      // Admin view: all projects
      projects = await db
        .collection('projects')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// Admin: Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const project = {
      ...body,
      status: body.status || 'planning',
      progress: body.progress || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      milestones: body.milestones || [],
      tasks: body.tasks || [],
      // Phase-based project support (Web Dev, E-commerce, etc.)
      phases: body.phases || [],
      // Video-based project support (Video Production, Content Marketing)
      videos: body.videos || [],
    };

    const result = await db.collection('projects').insertOne(project);

    return NextResponse.json({
      success: true,
      projectId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
