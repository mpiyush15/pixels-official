import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Admin logs payment for milestone on behalf of client
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { milestoneIndex, paymentMethod, paymentDetails, amount } = body;

    if (milestoneIndex === undefined) {
      return NextResponse.json(
        { error: 'Milestone index is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Get the project
    const project = await db.collection('projects').findOne({ _id: new ObjectId(id) });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const milestone = project.milestones[milestoneIndex];

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    // Mark milestone as paid and set to in-progress
    await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          [`milestones.${milestoneIndex}.paymentStatus`]: 'paid',
          [`milestones.${milestoneIndex}.paidAt`]: new Date(),
          [`milestones.${milestoneIndex}.paymentMethod`]: paymentMethod || 'offline',
          [`milestones.${milestoneIndex}.paymentDetails`]: paymentDetails || 'Logged by admin',
          [`milestones.${milestoneIndex}.paidAmount`]: amount || milestone.amount || 0,
          [`milestones.${milestoneIndex}.status`]: 'in-progress',
        },
      }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Payment logged successfully and milestone set to in-progress'
    });
  } catch (error) {
    console.error('Error logging milestone payment:', error);
    return NextResponse.json(
      { error: 'Failed to log milestone payment' },
      { status: 500 }
    );
  }
}
