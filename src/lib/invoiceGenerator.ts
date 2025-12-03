import { uploadInvoiceToS3 } from './s3';

export interface InvoiceItem {
  description: string;
  quantity?: number;
  rate?: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientAddress?: string;
  invoiceDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  notes?: string;
  status?: 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue';
}

/**
 * Generate professional HTML invoice
 */
export function generateInvoiceHTML(invoice: InvoiceData): string {
  const itemsHtml = invoice.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.rate || item.amount).toLocaleString('en-IN')}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">₹${item.amount.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const taxHtml = invoice.tax ? `
    <tr>
      <td colspan="3" style="padding: 12px; text-align: right; font-weight: 500;">Tax:</td>
      <td style="padding: 12px; text-align: right;">₹${invoice.tax.toLocaleString('en-IN')}</td>
    </tr>
  ` : '';

  const discountHtml = invoice.discount ? `
    <tr>
      <td colspan="3" style="padding: 12px; text-align: right; font-weight: 500; color: #10b981;">Discount:</td>
      <td style="padding: 12px; text-align: right; color: #10b981;">-₹${invoice.discount.toLocaleString('en-IN')}</td>
    </tr>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
          padding: 20px;
          position: relative;
        }
        .invoice-container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          padding: 60px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          position: relative;
        }
        .status-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          font-weight: 900;
          opacity: 0.08;
          pointer-events: none;
          z-index: 1;
          white-space: nowrap;
        }
        .status-watermark.paid {
          color: #10b981;
        }
        .status-watermark.draft {
          color: #6b7280;
        }
        .status-badge {
          position: absolute;
          top: 30px;
          right: 30px;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
          z-index: 10;
        }
        .status-badge.paid {
          background: #10b981;
          color: white;
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
        }
        .status-badge.draft {
          background: #6b7280;
          color: white;
          box-shadow: 0 4px 6px rgba(107, 114, 128, 0.3);
        }
        .status-badge.sent {
          background: #3b82f6;
          color: white;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
        }
        .status-badge.overdue {
          background: #ef4444;
          color: white;
          box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 50px;
          padding-bottom: 30px;
          border-bottom: 3px solid #667eea;
          position: relative;
          z-index: 5;
        }
        .company-info h1 {
          font-size: 36px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        .company-info p {
          color: #666;
          font-size: 14px;
        }
        .invoice-details {
          text-align: right;
        }
        .invoice-details h2 {
          font-size: 28px;
          color: #667eea;
          margin-bottom: 10px;
        }
        .invoice-details p {
          color: #666;
          font-size: 14px;
          margin: 4px 0;
        }
        .parties {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .party-box {
          flex: 1;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          margin: 0 10px;
        }
        .party-box:first-child { margin-left: 0; }
        .party-box:last-child { margin-right: 0; }
        .party-box h3 {
          font-size: 14px;
          text-transform: uppercase;
          color: #667eea;
          margin-bottom: 12px;
          font-weight: 600;
        }
        .party-box p {
          font-size: 14px;
          color: #333;
          margin: 4px 0;
        }
        .party-box strong {
          font-size: 16px;
          color: #000;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table thead {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .items-table th {
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
        }
        .items-table th:nth-child(2),
        .items-table th:nth-child(3),
        .items-table th:nth-child(4) {
          text-align: right;
        }
        .items-table th:nth-child(2) { text-align: center; }
        .totals {
          margin-left: auto;
          width: 350px;
        }
        .totals table {
          width: 100%;
          border-collapse: collapse;
        }
        .totals td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }
        .total-row {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .total-row td {
          padding: 18px 12px;
          font-size: 20px;
          font-weight: 700;
          border: none;
        }
        .notes {
          margin-top: 40px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .notes h4 {
          color: #667eea;
          margin-bottom: 10px;
          font-size: 14px;
          text-transform: uppercase;
        }
        .notes p {
          color: #666;
          font-size: 14px;
          line-height: 1.8;
        }
        .footer {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 2px solid #eee;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
        .footer p {
          margin: 4px 0;
        }
        @media print {
          body { background: white; padding: 0; }
          .invoice-container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Status Watermark -->
        ${invoice.status ? `<div class="status-watermark ${invoice.status}">${invoice.status.toUpperCase()}</div>` : ''}
        
        <!-- Status Badge -->
        ${invoice.status ? `<div class="status-badge ${invoice.status}">${invoice.status.toUpperCase()}</div>` : ''}
        
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <h1>PIXELS DIGITAL SOLUTIONS</h1>
            <p>Web Development Company</p>
            <p>info@pixelsdigital.tech</p>
            <p>www.pixelsdigital.tech</p>
          </div>
          <div class="invoice-details">
            <h2>INVOICE</h2>
            <p><strong>#${invoice.invoiceNumber}</strong></p>
            <p>Date: ${invoice.invoiceDate.toLocaleDateString('en-IN')}</p>
            <p>Due Date: ${invoice.dueDate.toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <!-- Parties (Bill To / Bill From) -->
        <div class="parties">
          <div class="party-box">
            <h3>Bill From</h3>
            <p><strong>Pixels Digital Solutions</strong></p>
            <p>Web Development Company</p>
            <p>Akola, India</p>
            <p>info@pixelsdigital.tech</p>
          </div>
          <div class="party-box">
            <h3>Bill To</h3>
            <p><strong>${invoice.clientName}</strong></p>
            ${invoice.clientCompany ? `<p>${invoice.clientCompany}</p>` : ''}
            ${invoice.clientAddress ? `<p>${invoice.clientAddress}</p>` : ''}
            <p>${invoice.clientEmail}</p>
          </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
          <table>
            <tr>
              <td style="padding: 12px; text-align: right; font-weight: 500;">Subtotal:</td>
              <td style="padding: 12px; text-align: right;">₹${invoice.subtotal.toLocaleString('en-IN')}</td>
            </tr>
            ${taxHtml}
            ${discountHtml}
            <tr class="total-row">
              <td style="text-align: right;">TOTAL:</td>
              <td style="text-align: right;">₹${invoice.total.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <!-- Notes -->
        ${invoice.notes ? `
          <div class="notes">
            <h4>Notes</h4>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <p><strong>Thank you for your business!</strong></p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p>© ${new Date().getFullYear()} Pixels Digital. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate invoice and upload to S3
 * Returns the S3 key and presigned URL
 */
export async function createAndUploadInvoice(invoice: InvoiceData): Promise<{
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}> {
  try {
    // Generate HTML
    const html = generateInvoiceHTML(invoice);

    // Upload to S3
    const filename = `invoice-${invoice.invoiceNumber}-${Date.now()}.html`;
    const result = await uploadInvoiceToS3(filename, html, 'text/html');

    return result;
  } catch (error: any) {
    console.error('Invoice generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate invoice',
    };
  }
}
