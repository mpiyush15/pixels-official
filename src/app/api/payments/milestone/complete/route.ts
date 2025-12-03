import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { projectId, milestoneIndex, orderId, amount } = await req.json();

    if (!projectId || milestoneIndex === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Get the project first
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId),
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update milestone in array
    const updatedMilestones = [...project.milestones];
    updatedMilestones[milestoneIndex] = {
      ...updatedMilestones[milestoneIndex],
      paymentStatus: 'paid',
      paidAt: new Date(),
      paidAmount: amount,
      cashfreeOrderId: orderId,
      status: 'in-progress'
    };

    // Auto-calculate progress based on completed milestones
    const totalMilestones = updatedMilestones.length;
    const completedMilestones = updatedMilestones.filter((m: any) => m.status === 'completed').length;
    const calculatedProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    // Update milestone payment status to paid and set status to in-progress
    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          milestones: updatedMilestones,
          progress: calculatedProgress,
          updatedAt: new Date()
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create payment record
    if (project) {
      await db.collection('payments').insertOne({
        projectId,
        clientId: project.clientId,
        milestoneIndex,
        milestoneName: project.milestones?.[milestoneIndex]?.name,
        amount,
        orderId,
        paymentMethod: 'Online',
        paymentDate: new Date(),
        status: 'completed',
        type: 'milestone',
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Milestone unlocked successfully',
    });
  } catch (error) {
    console.error('Complete milestone payment error:', error);
    return NextResponse.json(
      { error: 'Failed to complete milestone payment' },
      { status: 500 }
    );
  }
}
