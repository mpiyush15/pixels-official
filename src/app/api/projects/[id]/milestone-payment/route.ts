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
    const updatedMilestones = [...project.milestones];
    updatedMilestones[milestoneIndex] = {
      ...milestone,
      paymentStatus: 'paid',
      paidAt: new Date(),
      paymentMethod: paymentMethod || 'offline',
      paymentDetails: paymentDetails || 'Logged by admin',
      paidAmount: amount || milestone.amount || 0,
      status: 'in-progress'
    };

    // Auto-calculate progress based on completed milestones
    const totalMilestones = updatedMilestones.length;
    const completedMilestones = updatedMilestones.filter((m: any) => m.status === 'completed').length;
    const calculatedProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          milestones: updatedMilestones,
          progress: calculatedProgress,
          updatedAt: new Date()
        },
      }
    );

    // Create payment record
    await db.collection('payments').insertOne({
      projectId: id,
      clientId: project.clientId,
      milestoneIndex,
      milestoneName: milestone.title || milestone.name || `Milestone ${milestoneIndex + 1}`,
      amount: amount || milestone.amount || 0,
      paymentMethod: paymentMethod || 'offline',
      paymentDate: new Date(),
      status: 'completed',
      type: 'milestone',
      loggedBy: 'admin',
      paymentDetails: paymentDetails || 'Logged by admin',
      createdAt: new Date(),
    });

    // Auto-generate invoice for this payment
    const invoiceNumber = `INV-${Date.now()}`;
    const issueDate = new Date().toISOString().split('T')[0];
    const paidAmount = amount || milestone.amount || 0;
    
    await db.collection('invoices').insertOne({
      clientId: project.clientId,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      projectId: id,
      projectName: project.title || project.projectName || 'Project',
      invoiceNumber,
      issueDate,
      dueDate: issueDate, // Already paid, so due date is same as issue date
      status: 'paid',
      paidDate: issueDate,
      items: [
        {
          description: milestone.title || milestone.name || `Milestone ${milestoneIndex + 1}`,
          quantity: 1,
          rate: paidAmount,
          amount: paidAmount,
        },
      ],
      subtotal: paidAmount,
      tax: 0,
      taxRate: 0,
      total: paidAmount,
      notes: `Admin logged payment - ${paymentDetails || 'Payment received'}`,
      milestoneIndex,
      paymentMethod: paymentMethod || 'offline',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // If this is the first milestone (deposit), unlock the project
    if (project.requiresDepositPayment && !project.depositPaid && milestoneIndex === 0) {
      await db.collection('projects').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            depositPaid: true,
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Payment logged successfully and milestone set to in-progress',
      invoiceGenerated: true,
    });
  } catch (error) {
    console.error('Error logging milestone payment:', error);
    return NextResponse.json(
      { error: 'Failed to log milestone payment' },
      { status: 500 }
    );
  }
}
