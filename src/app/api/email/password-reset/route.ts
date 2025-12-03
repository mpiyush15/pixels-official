import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email';
import { getDatabase } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Send Password Reset Email
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const client = await db.collection('clients').findOne({ email });

    if (!client) {
      // Don't reveal if email exists or not (security)
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists, a password reset email has been sent' 
      });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: client._id.toString(), email: client.email, type: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in database
    await db.collection('clients').updateOne(
      { _id: client._id },
      { 
        $set: { 
          resetToken,
          resetTokenExpiry: new Date(Date.now() + 3600000) // 1 hour
        } 
      }
    );

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/client-portal/reset-password?token=${resetToken}`;
    const result = await sendPasswordResetEmail(
      client.email,
      client.name,
      resetUrl
    );

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Password reset email sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send email' 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Password reset email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
