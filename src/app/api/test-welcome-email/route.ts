import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email') || 'piyush@pixelsdigital.tech';
    const name = searchParams.get('name') || 'Test Client';
    
    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/client-portal/login`;
    
    console.log('Sending welcome email to:', email);
    console.log('Login URL:', loginUrl);
    
    const result = await sendWelcomeEmail(email, name, loginUrl);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Welcome email sent successfully!',
        messageId: result.messageId,
        sentTo: email,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Test welcome email error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send welcome email',
    }, { status: 500 });
  }
}
