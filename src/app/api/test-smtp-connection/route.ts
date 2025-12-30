import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Zeptomail API connection...');
    console.log('ZEPTOMAIL_API_TOKEN:', process.env.ZEPTOMAIL_API_TOKEN ? `[Set - ${process.env.ZEPTOMAIL_API_TOKEN.length} chars]` : '[Not Set]');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

    const zeptomailApiToken = process.env.ZEPTOMAIL_API_TOKEN;

    if (!zeptomailApiToken) {
      return NextResponse.json({
        success: false,
        error: 'ZEPTOMAIL_API_TOKEN not configured',
        message: 'Please set ZEPTOMAIL_API_TOKEN in environment variables'
      }, { status: 500 });
    }

    // Test Zeptomail API connection with a simple API call
    const response = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': zeptomailApiToken,
      },
      body: JSON.stringify({
        from: {
          address: process.env.EMAIL_FROM || 'noreply@pixelsdigital.tech',
          name: 'Pixels Digital'
        },
        to: [{
          email_address: {
            email_address: 'test@example.com'
          }
        }],
        subject: 'Test Email',
        htmlbody: '<p>This is a test email</p>',
        textbody: 'This is a test email',
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ Zeptomail API Test Failed:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });

      return NextResponse.json({
        success: false,
        error: responseData.message || 'Zeptomail API connection failed',
        details: responseData,
        config: {
          apiToken: process.env.ZEPTOMAIL_API_TOKEN ? `[Set - ${process.env.ZEPTOMAIL_API_TOKEN.length} chars]` : '[Not Set]',
          from: process.env.EMAIL_FROM,
        }
      }, { status: 500 });
    }

    console.log('✅ Zeptomail API connection successful!');

    return NextResponse.json({
      success: true,
      message: 'Zeptomail API connection verified successfully',
      config: {
        apiToken: `[Set - ${zeptomailApiToken.length} chars]`,
        from: process.env.EMAIL_FROM,
        endpoint: 'https://api.zeptomail.com/v1.1/email'
      },
      response: responseData
    });
  } catch (error: any) {
    console.error('❌ Zeptomail API connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Connection test failed',
      config: {
        apiToken: process.env.ZEPTOMAIL_API_TOKEN ? `[Set - ${process.env.ZEPTOMAIL_API_TOKEN.length} chars]` : '[Not Set]',
        from: process.env.EMAIL_FROM,
      }
    }, { status: 500 });
  }
}
