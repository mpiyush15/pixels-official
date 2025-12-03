import { NextRequest, NextResponse } from 'next/server';
import { createAndUploadInvoice } from '@/lib/invoiceGenerator';

/**
 * Test invoice generation and S3 upload
 */
export async function POST(request: NextRequest) {
  try {
    const { clientEmail } = await request.json();

    // Sample invoice data
    const invoiceData = {
      invoiceNumber: `TEST-INV-${Date.now()}`,
      clientName: 'Test Client',
      clientEmail: clientEmail || 'test@example.com',
      clientCompany: 'Test Company Pvt Ltd',
      clientAddress: 'Mumbai, Maharashtra, India',
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [
        {
          description: 'Website Development - Landing Page',
          quantity: 1,
          rate: 25000,
          amount: 25000,
        },
        {
          description: 'SEO Optimization',
          quantity: 1,
          rate: 10000,
          amount: 10000,
        },
        {
          description: 'Content Writing (5 pages)',
          quantity: 5,
          rate: 1000,
          amount: 5000,
        },
      ],
      subtotal: 40000,
      tax: 7200, // 18% GST
      discount: 0,
      total: 47200,
      notes: 'Thank you for your business! Payment terms: Net 30 days.',
    };

    // Generate and upload
    const result = await createAndUploadInvoice(invoiceData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Invoice generated and uploaded successfully!',
        data: {
          invoiceNumber: invoiceData.invoiceNumber,
          s3Key: result.key,
          s3Url: result.url,
          total: invoiceData.total,
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
    console.error('Test invoice generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
