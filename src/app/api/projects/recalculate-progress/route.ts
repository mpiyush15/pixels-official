import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// Recalculate progress for all projects based on milestones
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Get all projects
    const projects = await db.collection('projects').find({}).toArray();
    
    let updatedCount = 0;
    
    // Update each project's progress
    for (const project of projects) {
      const milestones = project.milestones || [];
      const totalMilestones = milestones.length;
      const completedMilestones = milestones.filter((m: any) => m.status === 'completed').length;
      const calculatedProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
      
      // Only update if progress has changed
      if (project.progress !== calculatedProgress) {
        await db.collection('projects').updateOne(
          { _id: project._id },
          { 
            $set: { 
              progress: calculatedProgress,
              updatedAt: new Date()
            } 
          }
        );
        updatedCount++;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Recalculated progress for ${updatedCount} projects`,
      totalProjects: projects.length,
      updatedProjects: updatedCount
    });
  } catch (error) {
    console.error('Error recalculating progress:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate progress' },
      { status: 500 }
    );
  }
}
