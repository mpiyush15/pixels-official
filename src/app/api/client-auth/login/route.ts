import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { sendLoginAlertEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const db = await getDatabase();

    // Find client by email
    const client = await db.collection('clients').findOne({ email });

    if (!client) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if client has password set
    if (!client.password) {
      return NextResponse.json(
        { error: 'Please contact admin to set up your account' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, client.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if client is active
    if (client.status === 'inactive') {
      return NextResponse.json(
        { error: 'Your account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    // Client type restriction removed - all clients can access portal

    // Create session (simple token for now)
    const response = NextResponse.json({
      success: true,
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
        company: client.company,
      },
    });

    // Set cookie
    response.cookies.set('client-session', client._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Send login alert email (don't wait for it)
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';
    sendLoginAlertEmail(
      client.email,
      client.name,
      ipAddress,
      new Date()
    ).catch(err => console.error('Failed to send login alert:', err));

    return response;
  } catch (error) {
    console.error('Client login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
