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

    // Update milestone payment status to paid and set status to in-progress
    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          [`milestones.${milestoneIndex}.paymentStatus`]: 'paid',
          [`milestones.${milestoneIndex}.paidAt`]: new Date(),
          [`milestones.${milestoneIndex}.paidAmount`]: amount,
          [`milestones.${milestoneIndex}.cashfreeOrderId`]: orderId,
          [`milestones.${milestoneIndex}.status`]: 'in-progress',
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create payment record
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId),
    });

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
