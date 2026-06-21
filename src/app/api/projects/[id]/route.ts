import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { FinanceDB } from '@/lib/finance';

import { createAndUploadInvoice } from '@/lib/invoiceGenerator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const project = await db.collection('projects').findOne({
      _id: new ObjectId(id),
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();

    // Auto-calculate progress based on milestones if milestones are provided
    if (body.milestones && Array.isArray(body.milestones)) {
      const oldProject = await db.collection('projects').findOne({ _id: new ObjectId(id) });
      const oldMilestones = oldProject?.milestones || [];
      const clientId = oldProject?.clientId;
      let client = null;
      if (clientId) {
        client = await db.collection('clients').findOne({ _id: new ObjectId(clientId) });
      }

      // Check for newly paid milestones to sync to finance
      for (let i = 0; i < body.milestones.length; i++) {
        const newM = body.milestones[i];
        const oldM = oldMilestones.find((m: any) => m.name === newM.name);
        
        // If it transitioned from unpaid/pending to paid, OR it is paid but missing from ledger (self-healing), sync it to Finance!
        if (newM.paymentStatus === 'paid') {
           const existingEntry = await db.collection('ledger_entries').findOne({
             referenceId: id,
             referenceType: 'Payment',
             description: { $regex: newM.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
           });

           if ((!oldM || oldM.paymentStatus !== 'paid') || !existingEntry) {
             // Ensure system accounts exist
             await FinanceDB.ensureSystemAccounts();
             
             const cashAccount = await FinanceDB.getAccountByName('Cash in Hand');
             const salesAccount = await FinanceDB.getAccountByName('Sales Revenue');
             const accountsReceivable = await FinanceDB.getAccountByName('Accounts Receivable');

             // Find the specific account or default to Cash in Hand
             let targetAccountId = cashAccount?._id?.toString();
             if (newM.paymentAccountId) {
               targetAccountId = newM.paymentAccountId;
             }

             const amount = parseFloat(newM.amount) || 0;
             if (targetAccountId && salesAccount && accountsReceivable && amount > 0) {
               // --- 1. Generate Invoice ---
               const count = await db.collection('invoices').countDocuments();
               const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;
               
               const invoice = {
                 invoiceNumber,
                 clientId: clientId || null,
                 clientName: client?.name || oldProject?.clientName || 'Unknown Client',
                 clientEmail: client?.email || oldProject?.clientEmail || '',
                 clientPhone: client?.phone || '',
                 clientCompany: client?.company || '',
                 clientAddress: client?.address || '',
                 projectId: id,
                 projectName: oldProject?.projectName || 'Project',
                 services: [
                   {
                     name: `Project Phase: ${newM.name}`,
                     quantity: 1,
                     price: amount,
                     amount: amount
                   }
                 ],
                 subtotal: amount,
                 discount: 0,
                 discountType: 'percentage' as const,
                 discountAmount: 0,
                 advancePayment: 0,
                 tax: 0,
                 total: amount,
                 status: 'paid', // Immediately mark as paid
                 issueDate: new Date(),
                 dueDate: new Date(), // Due immediately
                 createdAt: new Date(),
               };

               const invoiceResult = await db.collection('invoices').insertOne(invoice);

               // Generate S3 Upload in background without blocking
               (async () => {
                 try {
                   const invoiceData = {
                     ...invoice,
                     invoiceDate: invoice.issueDate,
                     items: invoice.services.map(s => ({
                       description: s.name,
                       quantity: s.quantity,
                       rate: s.price,
                       amount: s.amount
                     })),
                     status: 'paid' as const
                   };
                   const uploadResult = await createAndUploadInvoice(invoiceData);
                   if (uploadResult.success) {
                     await db.collection('invoices').updateOne(
                       { _id: invoiceResult.insertedId },
                       { $set: { s3Key: uploadResult.key, s3Url: uploadResult.url, s3UploadedAt: new Date() } }
                     );
                     console.log('Project auto-invoice uploaded:', uploadResult.key);
                   }
                 } catch(err) {
                   console.error('Failed to upload auto-invoice', err);
                 }
               })();

               // --- Cash Basis Journal Entry ---
               await FinanceDB.createJournalEntry([
                 {
                   accountId: targetAccountId,
                   type: 'Debit',
                   amount: amount,
                   currency: 'INR',
                   date: new Date(),
                   description: `Project Payment: ${oldProject?.projectName || 'Project'} - ${newM.name}`,
                   referenceType: 'Payment',
                   referenceId: id
                 },
                 {
                   accountId: salesAccount._id!.toString(),
                   type: 'Credit',
                   amount: amount,
                   currency: 'INR',
                   date: new Date(),
                   description: `Project Revenue: ${oldProject?.projectName || 'Project'} - ${newM.name}`,
                   referenceType: 'Invoice',
                   referenceId: invoiceResult.insertedId.toString()
                 }
               ]);
             }
           }
        }
      }

      const totalMilestones = body.milestones.length;
      const completedMilestones = body.milestones.filter((m: any) => m.status === 'completed').length;
      body.progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    }

    const { _id, ...updateData } = body;

    await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    await db.collection('projects').deleteOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
