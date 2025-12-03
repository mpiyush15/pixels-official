import { NextRequest, NextResponse } from 'next/server';
import { sendInvoiceEmail } from '@/lib/email';
import { uploadInvoiceToS3 } from '@/lib/s3';

/**
 * Send Test Invoice Email with S3-hosted invoice
 * Quick endpoint to test invoice email functionality
 */
export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();

    if (!to) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 });
    }

    // Sample invoice data
    const invoiceData = {
      clientName: 'John Doe',
      invoiceNumber: `INV-2025-${Date.now()}`,
      amount: 25000,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      items: [
        { description: 'Website Development - Homepage', amount: 15000 },
        { description: 'Website Development - About Page', amount: 5000 },
        { description: 'Responsive Design Implementation', amount: 5000 },
      ],
    };

    // Generate invoice HTML content
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
          .header { text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 32px; font-weight: bold; color: #667eea; }
          .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-details div { flex: 1; }
          .items { margin: 30px 0; }
          .item-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
          .total { font-size: 24px; font-weight: bold; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
          .footer { text-align: center; margin-top: 50px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">PIXELS DIGITAL</div>
          <p>Creating Top Digital Solutions</p>
        </div>
        
        <div class="invoice-details">
          <div>
            <h3>Invoice To:</h3>
            <p><strong>${invoiceData.clientName}</strong></p>
            <p>${to}</p>
          </div>
          <div style="text-align: right;">
            <h3>Invoice #${invoiceData.invoiceNumber}</h3>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${invoiceData.dueDate.toLocaleDateString()}</p>
          </div>
        </div>

        <div class="items">
          <h3>Items</h3>
          ${invoiceData.items.map(item => `
            <div class="item-row">
              <span>${item.description}</span>
              <span>₹${item.amount.toLocaleString('en-IN')}</span>
            </div>
          `).join('')}
        </div>

        <div class="total">
          Total Amount: ₹${invoiceData.amount.toLocaleString('en-IN')}
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Pixels Digital | support@pixelsdigital.tech</p>
          <p>© ${new Date().getFullYear()} Pixels Digital. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Upload invoice to S3
    console.log('Uploading invoice to S3...');
    const filename = `invoice-${invoiceData.invoiceNumber}.html`;
    const uploadResult = await uploadInvoiceToS3(filename, invoiceHtml, 'text/html');

    if (!uploadResult.success) {
      console.error('S3 upload failed:', uploadResult.error);
      // Continue anyway - send email without S3 link
    }

    // Send email with S3 link (if upload succeeded)
    const result = await sendInvoiceEmail(
      to,
      invoiceData.clientName,
      invoiceData.invoiceNumber,
      invoiceData.amount,
      invoiceData.dueDate,
      invoiceData.items,
      uploadResult.url // Pass S3 presigned URL
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test invoice email sent successfully!',
        messageId: result.messageId,
        details: {
          to,
          invoiceNumber: invoiceData.invoiceNumber,
          amount: invoiceData.amount,
          dueDate: invoiceData.dueDate,
          s3Upload: uploadResult.success ? 'Success' : 'Failed',
          s3Url: uploadResult.url,
          s3Key: uploadResult.key,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Test invoice email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
