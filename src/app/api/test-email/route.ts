import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    // Test email
    const result = await sendEmail({
      to: 'piyush@pixelsdigital.tech',
      subject: 'Test Email from Pixels Digital - Zeptomail Setup',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0; color: #155724; }
            .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Email Setup Successful!</h1>
            </div>
            <div class="content">
              <div class="success-box">
                <strong>✅ Test Email Sent Successfully</strong>
                <p>Your Zeptomail SMTP configuration is working perfectly!</p>
              </div>
              <h2>Configuration Details:</h2>
              <div class="info">
                <p><strong>SMTP Host:</strong> smtp.zeptomail.in</p>
                <p><strong>Port:</strong> 587 (TLS)</p>
                <p><strong>From Email:</strong> noreply@enromatics.com</p>
                <p><strong>Domain:</strong> enromatics.com</p>
              </div>
              <h3>What's Next?</h3>
              <ul>
                <li>✅ Welcome emails for new clients</li>
                <li>✅ Invoice notifications</li>
                <li>✅ Payment confirmations</li>
                <li>✅ Password reset emails</li>
                <li>✅ Project update notifications</li>
              </ul>
              <p>All email features are now active and ready to use!</p>
              <p><strong>Best regards,</strong><br>Pixels Digital Solutions Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Pixels Digital Solutions. All rights reserved.</p>
              <p>info@pixelsdigital.tech | pixelsdigital.tech</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send test email',
    }, { status: 500 });
  }
}
