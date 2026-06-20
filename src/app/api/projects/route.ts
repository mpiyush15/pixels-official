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

    // Attach financial data to projects
    const projectsWithFinancials = await Promise.all(
      projects.map(async (project) => {
        // 1. Calculate Revenue (Sum of amountPaid for all invoices linked to this project)
        const invoices = await db.collection('invoices').find({ projectId: project._id.toString() }).toArray();
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);

        // 2. Calculate Costs (Sum of amount for all expenses linked to this project)
        const expenses = await db.collection('expenses').find({ projectId: project._id.toString() }).toArray();
        const totalCost = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

        return {
          ...project,
          totalRevenue,
          totalCost,
          profitMargin: totalRevenue - totalCost
        };
      })
    );

    return NextResponse.json(projectsWithFinancials);
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

    // 🔥 CRITICAL: Fetch client email from clientId to ensure proper linking
    let clientEmail = body.clientEmail;
    if (body.clientId && !clientEmail) {
      const client = await db.collection('clients').findOne({
        _id: new ObjectId(body.clientId),
      });
      if (client) {
        clientEmail = client.email;
      }
    }

    // Auto-calculate progress based on milestones
    const milestones = body.milestones || [];
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter((m: any) => m.status === 'completed').length;
    const calculatedProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const project = {
      ...body,
      clientId: body.clientId, // 🔥 Ensure clientId is set
      clientEmail: clientEmail, // 🔥 Ensure clientEmail is set
      status: body.status || 'planning',
      progress: calculatedProgress,
      createdAt: new Date(),
      updatedAt: new Date(),
      milestones: milestones,
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
