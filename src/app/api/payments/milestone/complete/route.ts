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

      // Auto-generate invoice for this payment
      const milestone = updatedMilestones[milestoneIndex];
      const invoiceNumber = `INV-${Date.now()}`;
      const issueDate = new Date().toISOString().split('T')[0];
      
      await db.collection('invoices').insertOne({
        clientId: project.clientId,
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        projectId,
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
            rate: amount,
            amount: amount,
          },
        ],
        subtotal: amount,
        tax: 0,
        taxRate: 0,
        total: amount,
        notes: `Payment for ${milestone.title || milestone.name || 'milestone'} - Order ID: ${orderId}`,
        milestoneIndex,
        cashfreeOrderId: orderId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // If this is the first milestone (deposit), unlock the project
      if (project.requiresDepositPayment && !project.depositPaid && milestoneIndex === 0) {
        await db.collection('projects').updateOne(
          { _id: new ObjectId(projectId) },
          {
            $set: {
              depositPaid: true,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Milestone unlocked successfully',
      invoiceGenerated: true,
    });
  } catch (error) {
    console.error('Complete milestone payment error:', error);
    return NextResponse.json(
      { error: 'Failed to complete milestone payment' },
      { status: 500 }
    );
  }
}
