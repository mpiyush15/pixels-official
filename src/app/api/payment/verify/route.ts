import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import Cashfree from '@/lib/cashfree';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { 
  sendContractAcceptanceEmail, 
  sendInvoiceEmail, 
  sendLoginCredentialsEmail 
} from '@/lib/email';

// Generate a random 6-digit password
function generateSixDigitPassword() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, token } = await request.json();

    if (!orderId || !token) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Verify Payment with Cashfree
    const response = await Cashfree.PGOrderFetchPayments(orderId);
    const payments = response.data;
    
    // Check if any payment was successful
    const successfulPayment = payments.find((p: any) => p.payment_status === 'SUCCESS');
    
    if (!successfulPayment) {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // 2. Fetch Project
    const project = await db.collection('projects').findOne({ proposalToken: token });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.contractAccepted) {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    // 3. Update Milestone status
    let updatedMilestones = project.milestones || [];
    const nextMilestoneIndex = updatedMilestones.findIndex((m: any) => m.status !== 'completed');
    const amountPaid = successfulPayment.payment_amount || 0;

    if (nextMilestoneIndex !== -1) {
      updatedMilestones[nextMilestoneIndex].status = 'completed';
    }

    // Calculate progress
    const totalMilestones = updatedMilestones.length;
    const completedMilestones = updatedMilestones.filter((m: any) => m.status === 'completed').length;
    const calculatedProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    // 4. Client Account Creation / Updating
    const clientEmail = project.clientEmail;
    let clientId = project.clientId;
    const password = generateSixDigitPassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let client = await db.collection('clients').findOne({ email: clientEmail });
    
    if (!client) {
      // Create new client
      const newClient = {
        name: project.clientName || 'Client',
        email: clientEmail,
        password: hashedPassword,
        phone: '',
        company: '',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const clientResult = await db.collection('clients').insertOne(newClient);
      clientId = clientResult.insertedId.toString();
    } else {
      // Update existing client with new 6-digit password for this project
      clientId = client._id.toString();
      await db.collection('clients').updateOne(
        { _id: client._id },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );
    }

    // 5. Create Invoice
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const invoice = {
      invoiceNumber,
      projectId: project._id.toString(),
      clientId: clientId,
      amount: amountPaid,
      amountPaid: amountPaid,
      status: 'paid',
      issueDate: new Date(),
      dueDate: new Date(), // Paid immediately
      items: [{
        description: nextMilestoneIndex !== -1 ? `Advance for ${updatedMilestones[nextMilestoneIndex].name}` : 'Project Advance Payment',
        amount: amountPaid
      }],
      notes: `Paid via Cashfree (Order: ${orderId})`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection('invoices').insertOne(invoice);

    // 6. Update Project
    await db.collection('projects').updateOne(
      { _id: project._id },
      {
        $set: {
          contractAccepted: true,
          contractAcceptedAt: new Date(),
          contractAcceptedBy: clientEmail,
          status: 'active',
          proposalToken: null, // Invalidate token so it can't be used again
          milestones: updatedMilestones,
          progress: calculatedProgress,
          clientId: clientId, // Ensure it's linked
          updatedAt: new Date()
        }
      }
    );

    // 7. Send Emails (Non-blocking)
    try {
      const portalUrl = `${'https://pixelsdigitalsolutions.com'}/client-portal/login`;
      
      // Send Contract Acceptance Email
      await sendContractAcceptanceEmail(
        clientEmail, 
        project.clientName || 'Client', 
        project.projectName, 
        'Development'
      );

      // Send Invoice Email
      await sendInvoiceEmail(
        clientEmail,
        project.clientName || 'Client',
        invoiceNumber,
        amountPaid,
        new Date(),
        invoice.items
      );

      // Send Login Credentials
      await sendLoginCredentialsEmail(
        clientEmail,
        project.clientName || 'Client',
        clientEmail,
        password, // Raw 6-digit password
        portalUrl
      );
    } catch (emailErr) {
      console.error('Failed to send some emails after payment verification:', emailErr);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error verifying Cashfree payment:', error?.response?.data || error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
