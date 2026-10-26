import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();

    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const research = await db.collection('client_researches').findOne(query);

    if (!research) {
      return NextResponse.json(
        { error: 'Research record not found' },
        { status: 404 }
      );
    }

    const {
      projectName,
      projectType = 'Web Development',
      description,
      budget = 0,
      startDate = new Date().toISOString().split('T')[0],
      endDate,
      milestones = [],
      advanceAmount = 0,
      paymentMethod = 'Bank Transfer',
      transactionReference = '',
      generateInvoice = true,
    } = body;

    // Fetch client to ensure latest data
    let client: any = null;
    try {
      client = await db.collection('clients').findOne({ _id: new ObjectId(research.clientId) });
    } catch {
      client = await db.collection('clients').findOne({ _id: research.clientId });
    }

    const clientName = client?.name || research.clientName || 'Valued Client';
    const clientEmail = client?.email || research.clientEmail || '';
    const company = client?.company || research.companyName || '';

    // Generate proposal token for client view
    const proposalToken = crypto.randomBytes(16).toString('hex');

    // Build Project Object
    const formattedMilestones = milestones.map((m: any, index: number) => ({
      name: m.name || `Phase ${index + 1}`,
      description: m.description || '',
      status: index === 0 && advanceAmount > 0 ? 'in-progress' : 'pending',
      dueDate: m.dueDate || m.targetWeeks || '',
      amount: Number(m.amount) || 0,
      paymentStatus: index === 0 && advanceAmount > 0 ? 'paid' : 'unpaid',
      paidAt: index === 0 && advanceAmount > 0 ? new Date().toISOString() : undefined,
    }));

    const activityLog = [
      {
        id: crypto.randomBytes(8).toString('hex'),
        title: 'Project Initiated from Research',
        description: `Project setup initiated from Discovery Report: "${research.title}".`,
        date: new Date().toISOString(),
        type: 'system',
      }
    ];

    if (advanceAmount > 0) {
      activityLog.push({
        id: crypto.randomBytes(8).toString('hex'),
        title: 'Advance Payment Received',
        description: `Received advance of ₹${Number(advanceAmount).toLocaleString('en-IN')} via ${paymentMethod} (Ref: ${transactionReference || 'Direct'}).`,
        date: new Date().toISOString(),
        type: 'payment',
      });
    }

    const newProject = {
      projectName: projectName || `${company} - ${research.title}`,
      clientId: research.clientId,
      clientName: clientName,
      clientEmail: clientEmail,
      company: company,
      projectType: projectType,
      description: description || research.recommendations?.suggestedScope || research.executiveSummary || 'Project initiated from client discovery research.',
      status: 'in-progress',
      progress: advanceAmount > 0 ? 10 : 0,
      budget: Number(budget) || 0,
      startDate: startDate,
      endDate: endDate || '',
      milestones: formattedMilestones,
      tasks: [],
      phases: [],
      videos: [],
      proposalToken: proposalToken,
      agreementText: 'Standard Pixels Digital Solutions terms and conditions apply.',
      activityLog: activityLog,
      sourceResearchId: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const projectResult = await db.collection('projects').insertOne(newProject);
    const projectIdStr = projectResult.insertedId.toString();

    let createdInvoiceId: string | null = null;

    // Handle Advance Payment & Invoice Generation
    if (generateInvoice && Number(advanceAmount) > 0) {
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const numAdvance = Number(advanceAmount);

      const invoiceDoc = {
        invoiceNumber,
        clientId: research.clientId,
        clientName: clientName,
        clientEmail: clientEmail,
        company: company,
        projectId: projectIdStr,
        projectName: newProject.projectName,
        items: [
          {
            description: `Advance Payment for Project Kickoff: ${newProject.projectName}`,
            quantity: 1,
            rate: numAdvance,
            amount: numAdvance,
          }
        ],
        subtotal: numAdvance,
        tax: 0,
        total: numAdvance,
        amountPaid: numAdvance,
        balance: 0,
        status: 'paid',
        paymentMethod: paymentMethod,
        transactionId: transactionReference,
        issueDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        notes: `Advance payment recorded via Client Research Kickoff. Ref: ${transactionReference || 'N/A'}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const invResult = await db.collection('invoices').insertOne(invoiceDoc);
      createdInvoiceId = invResult.insertedId.toString();

      // Record payment entry
      const paymentDoc = {
        invoiceId: createdInvoiceId,
        invoiceNumber: invoiceNumber,
        clientId: research.clientId,
        clientName: clientName,
        projectId: projectIdStr,
        projectName: newProject.projectName,
        amount: numAdvance,
        paymentMethod: paymentMethod,
        transactionId: transactionReference,
        paymentDate: new Date(),
        status: 'completed',
        notes: `Advance payment for ${newProject.projectName}`,
        createdAt: new Date(),
      };

      await db.collection('payments').insertOne(paymentDoc);

      // Increment client's revenue and project count
      try {
        await db.collection('clients').updateOne(
          { _id: new ObjectId(research.clientId) },
          {
            $inc: {
              totalRevenue: numAdvance,
              projectsCount: 1,
            }
          }
        );
      } catch {
        await db.collection('clients').updateOne(
          { _id: research.clientId },
          {
            $inc: {
              totalRevenue: numAdvance,
              projectsCount: 1,
            }
          }
        );
      }
    } else {
      // Just increment project count
      try {
        await db.collection('clients').updateOne(
          { _id: new ObjectId(research.clientId) },
          { $inc: { projectsCount: 1 } }
        );
      } catch {
        await db.collection('clients').updateOne(
          { _id: research.clientId },
          { $inc: { projectsCount: 1 } }
        );
      }
    }

    // Update research record
    const kickoffDetails = {
      projectId: projectIdStr,
      advancePaidAmount: Number(advanceAmount),
      paymentMethod: paymentMethod,
      transactionReference: transactionReference,
      invoiceId: createdInvoiceId,
      convertedAt: new Date(),
    };

    await db.collection('client_researches').updateOne(
      query,
      {
        $set: {
          status: 'converted',
          convertedProjectId: projectIdStr,
          kickoffDetails,
          updatedAt: new Date(),
        }
      }
    );

    return NextResponse.json({
      success: true,
      projectId: projectIdStr,
      invoiceId: createdInvoiceId,
      message: 'Project successfully kicked off with advance payment recorded.',
    });
  } catch (error: any) {
    console.error('Error during project kickoff:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to kickoff project' },
      { status: 500 }
    );
  }
}
