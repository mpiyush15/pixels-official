import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { submissionId, totalAmount, depositAmount } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: 'Valid total amount is required' }, { status: 400 });
    }

    const db = await getDatabase();

    // Get the submission
    const submission = await db.collection('workSubmissions').findOne({
      _id: new ObjectId(submissionId)
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Get client details
    const clientDoc = await db.collection('clients').findOne({
      _id: new ObjectId(submission.clientId)
    });

    if (!clientDoc) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Create milestones
    const milestones = [];
    
    // If deposit amount is provided, create a deposit milestone
    if (depositAmount && depositAmount > 0) {
      milestones.push({
        _id: new ObjectId(),
        title: 'Initial Deposit',
        description: 'Deposit payment to unlock project access',
        amount: depositAmount,
        paymentStatus: 'unpaid',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        completed: false
      });
    }

    // Calculate remaining amount for final milestone
    const remainingAmount = totalAmount - (depositAmount || 0);
    if (remainingAmount > 0) {
      milestones.push({
        _id: new ObjectId(),
        title: 'Final Payment',
        description: 'Final project payment upon completion',
        amount: remainingAmount,
        paymentStatus: 'unpaid',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        completed: false
      });
    } else if (milestones.length === 0) {
      // If no deposit and no remaining amount, create a single milestone for full amount
      milestones.push({
        _id: new ObjectId(),
        title: 'Project Payment',
        description: 'Full project payment',
        amount: totalAmount,
        paymentStatus: 'unpaid',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: false
      });
    }

    // Calculate initial progress (0% since no milestones completed)
    const progress = 0;

    // Create the project
    const newProject = {
      clientId: submission.clientId,
      clientName: clientDoc.name,
      clientEmail: clientDoc.email,
      title: submission.title,
      description: submission.description || 'Project created from submitted work',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: totalAmount,
      milestones: milestones,
      progress: progress,
      requiresDepositPayment: depositAmount && depositAmount > 0,
      depositPaid: false,
      createdAt: new Date(),
      createdFromSubmission: true,
      submissionId: submission._id,
      submissionFileKey: submission.fileKey,
      submissionFileName: submission.fileName
    };

    const result = await db.collection('projects').insertOne(newProject);

    // Update submission status to converted
    await db.collection('workSubmissions').updateOne(
      { _id: new ObjectId(submissionId) },
      {
        $set: {
          status: 'converted',
          convertedToProjectId: result.insertedId,
          convertedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      projectId: result.insertedId.toString(),
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error converting submission to project:', error);
    return NextResponse.json(
      { error: 'Failed to convert submission to project' },
      { status: 500 }
    );
  }
}
