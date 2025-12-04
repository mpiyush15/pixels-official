import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createAndUploadInvoice } from '@/lib/invoiceGenerator';
import { sendInvoiceEmail } from '@/lib/email';
import { getPresignedDownloadUrl } from '@/lib/s3';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();

    const updateData: any = {};
    
    if (body.status) {
      // Get the invoice to check previous status
      const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(id) });
      
      if (!invoice) {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }

      const previousStatus = invoice.status;
      const newStatus = body.status;
      
      updateData.status = newStatus;
      
      // If marking as paid, add paid date and payment info
      if (newStatus === 'paid') {
        updateData.paidAt = new Date();
        
        if (body.paymentMethod) {
          updateData.paymentMethod = body.paymentMethod;
        }
        
        if (body.paymentDetails) {
          updateData.paymentDetails = body.paymentDetails;
        }

        // Add revenue to client if not previously paid
        if (previousStatus !== 'paid' && invoice.clientId) {
          await db.collection('clients').updateOne(
            { _id: new ObjectId(invoice.clientId) },
            { 
              $inc: { totalRevenue: invoice.total }
            }
          );
        }
      }
      
      // If marking as cancelled, add cancelled date
      if (newStatus === 'cancelled') {
        updateData.cancelledAt = new Date();

        // Remove revenue from client if previously paid
        if (previousStatus === 'paid' && invoice.clientId) {
          await db.collection('clients').updateOne(
            { _id: new ObjectId(invoice.clientId) },
            { 
              $inc: { totalRevenue: -invoice.total }
            }
          );
        }
      }

      // If changing from paid to another status (not cancelled), remove revenue
      if (previousStatus === 'paid' && newStatus !== 'paid' && newStatus !== 'cancelled' && invoice.clientId) {
        await db.collection('clients').updateOne(
          { _id: new ObjectId(invoice.clientId) },
          { 
            $inc: { totalRevenue: -invoice.total }
          }
        );
      }

      // Regenerate PDF with updated status for 'sent' and 'paid' statuses
      if (newStatus === 'sent' || newStatus === 'paid') {
        try {
          const invoiceData = {
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            clientEmail: invoice.clientEmail,
            clientCompany: invoice.clientCompany,
            clientAddress: invoice.clientAddress,
            invoiceDate: new Date(invoice.issueDate),
            dueDate: new Date(invoice.dueDate),
            items: invoice.services.map((service: any) => ({
              description: service.name || service.description,
              quantity: service.quantity || 1,
              rate: service.price || service.amount,
              amount: service.amount || service.price,
            })),
            subtotal: invoice.subtotal,
            tax: invoice.tax || 0,
            discount: invoice.discount || 0,
            total: invoice.total,
            notes: invoice.notes || '',
            status: newStatus,
          };

          const uploadResult = await createAndUploadInvoice(invoiceData);

          if (uploadResult.success) {
            updateData.s3Key = uploadResult.key;
            updateData.s3Url = uploadResult.url;
            updateData.s3UploadedAt = new Date();
            console.log('Invoice PDF regenerated with status:', newStatus);
          }
        } catch (regenerateError) {
          console.error('Error regenerating invoice PDF:', regenerateError);
          // Continue with status update even if PDF regeneration fails
        }
      }

      // Send email notification when invoice is marked as 'sent'
      if (newStatus === 'sent' && previousStatus !== 'sent') {
        try {
          // Get presigned URL for invoice download
          let invoiceUrl;
          if (updateData.s3Key || invoice.s3Key) {
            invoiceUrl = await getPresignedDownloadUrl(updateData.s3Key || invoice.s3Key, 604800); // 7 days
          }

          await sendInvoiceEmail(
            invoice.clientEmail,
            invoice.clientName,
            invoice.invoiceNumber,
            invoice.total,
            new Date(invoice.dueDate),
            invoice.services.map((service: any) => ({
              description: service.name || service.description,
              amount: service.quantity * service.price,
            })),
            invoiceUrl
          );
          console.log('Invoice email sent to:', invoice.clientEmail);
        } catch (emailError) {
          console.error('Error sending invoice email:', emailError);
          // Continue with status update even if email fails
        }
      }
    }

    await db.collection('invoices').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
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
    
    await db.collection('invoices').deleteOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
