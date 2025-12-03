import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

/**
 * Test Email Endpoint - Admin Only
 * Test email configuration
 */
export async function POST(request: NextRequest) {
  try {
    const { to, testType } = await request.json();

    if (!to) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 });
    }

    // Simple test email
    const result = await sendEmail({
      to,
      subject: `Test Email from Pixels Digital - ${testType || 'Basic Test'}`,
      html: `
        <h1>✅ Email Configuration Working!</h1>
        <p>This is a test email from your Pixels Digital system.</p>
        <p>If you're seeing this, your email service is configured correctly.</p>
        <p><strong>Test Type:</strong> ${testType || 'Basic Test'}</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.messageId 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
