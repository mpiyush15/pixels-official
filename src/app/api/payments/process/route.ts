import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Process payment from client portal (for invoices, phases, or videos)
export async function POST(request: NextRequest) {
  try {
    const clientId = request.cookies.get('client-session')?.value;
    
    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, invoiceId, projectId, phaseId, videoId, amount, paymentMethod } = body;

    const db = await getDatabase();

    // Generate invoice number if creating new invoice
    const generateInvoiceNumber = async () => {
      const lastInvoice = await db
        .collection('invoices')
        .find({})
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();

      if (lastInvoice.length === 0) {
        return 'INV-0001';
      }

      const lastNumber = parseInt(lastInvoice[0].invoiceNumber.split('-')[1]);
      return `INV-${String(lastNumber + 1).padStart(4, '0')}`;
    };

    if (type === 'invoice') {
      // Payment for existing invoice
      const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(invoiceId) });
      
      if (!invoice || invoice.clientId !== clientId) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      // Create payment record
      const payment = {
        invoiceId,
        clientId,
        amount: invoice.total,
        paymentMethod: paymentMethod || 'Online',
        paymentDate: new Date(),
        status: 'completed',
        createdAt: new Date(),
      };

      await db.collection('payments').insertOne(payment);

      // Update invoice status
      await db.collection('invoices').updateOne(
        { _id: new ObjectId(invoiceId) },
        { $set: { status: 'paid', updatedAt: new Date() } }
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Payment processed successfully',
        invoiceId 
      });

    } else if (type === 'phase') {
      // Payment for project phase
      const project = await db.collection('projects').findOne({
        _id: new ObjectId(projectId),
        clientId,
      });

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      const phase = project.phases?.find((p: any) => p._id === phaseId);
      if (!phase) {
        return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
      }

      // Create invoice for phase
      const invoiceNumber = await generateInvoiceNumber();
      const invoice = {
        invoiceNumber,
        clientId,
        projectId,
        phaseId,
        items: [
          {
            description: `${project.name} - ${phase.name}`,
            quantity: 1,
            rate: phase.amount,
            amount: phase.amount,
          },
        ],
        subtotal: phase.amount,
        tax: 0,
        total: phase.amount,
        status: 'paid',
        issueDate: new Date(),
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const invoiceResult = await db.collection('invoices').insertOne(invoice);

      // Create payment record
      const payment = {
        invoiceId: invoiceResult.insertedId.toString(),
        clientId,
        projectId,
        phaseId,
        amount: phase.amount,
        paymentMethod: paymentMethod || 'Online',
        paymentDate: new Date(),
        status: 'completed',
        createdAt: new Date(),
      };

      await db.collection('payments').insertOne(payment);

      // Update phase status
      await db.collection('projects').updateOne(
        {
          _id: new ObjectId(projectId),
          'phases._id': phaseId,
        },
        {
          $set: {
            'phases.$.paymentStatus': 'paid',
            'phases.$.status': 'unlocked',
            'phases.$.invoiceId': invoiceResult.insertedId.toString(),
            'phases.$.updatedAt': new Date(),
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Phase payment processed successfully',
        invoiceId: invoiceResult.insertedId.toString(),
      });

    } else if (type === 'video') {
      // Payment for video
      const project = await db.collection('projects').findOne({
        _id: new ObjectId(projectId),
        clientId,
      });

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      const video = project.videos?.find((v: any) => v._id === videoId);
      if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
      }

      // Create invoice for video
      const invoiceNumber = await generateInvoiceNumber();
      const invoice = {
        invoiceNumber,
        clientId,
        projectId,
        videoId,
        items: [
          {
            description: `${project.name} - ${video.title}`,
            quantity: 1,
            rate: video.amount,
            amount: video.amount,
          },
        ],
        subtotal: video.amount,
        tax: 0,
        total: video.amount,
        status: 'paid',
        issueDate: new Date(),
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const invoiceResult = await db.collection('invoices').insertOne(invoice);

      // Create payment record
      const payment = {
        invoiceId: invoiceResult.insertedId.toString(),
        clientId,
        projectId,
        videoId,
        amount: video.amount,
        paymentMethod: paymentMethod || 'Online',
        paymentDate: new Date(),
        status: 'completed',
        createdAt: new Date(),
      };

      await db.collection('payments').insertOne(payment);

      // Update video status
      await db.collection('projects').updateOne(
        {
          _id: new ObjectId(projectId),
          'videos._id': videoId,
        },
        {
          $set: {
            'videos.$.paymentStatus': 'paid',
            'videos.$.invoiceId': invoiceResult.insertedId.toString(),
            'videos.$.updatedAt': new Date(),
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Video payment processed successfully',
        invoiceId: invoiceResult.insertedId.toString(),
      });

    } else {
      return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
