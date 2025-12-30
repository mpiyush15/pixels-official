import { getDatabase } from '@/lib/mongodb';
import { sendLoginCredentialsEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// Generate random 8-digit numeric password
function generateNumericPassword(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const db = await getDatabase();
    const client = await db.collection('clients').findOne({
      _id: new ObjectId(id),
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!client.email) {
      return NextResponse.json(
        { error: 'Client has no email address' },
        { status: 400 }
      );
    }

    // Generate auto password
    const autoPassword = generateNumericPassword();

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(autoPassword, 10);

    // Save hashed password to database
    await db.collection('clients').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          password: hashedPassword,
          portalAccessEnabled: true,
          updatedAt: new Date(),
        },
      }
    );

    const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/client-portal/login`;

    console.log('[SEND LOGIN CREDENTIALS] Sending login credentials to:', client.email);
    console.log('[SEND LOGIN CREDENTIALS] Generated password:', autoPassword);
    console.log('[SEND LOGIN CREDENTIALS] Password hashed and saved to database');

    const emailResult = await sendLoginCredentialsEmail(
      client.email,
      client.name,
      client.email,
      autoPassword,
      portalUrl
    );

    if (!emailResult.success) {
      console.error('[SEND LOGIN CREDENTIALS] Email failed:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

    console.log('[SEND LOGIN CREDENTIALS] Email sent successfully. Message ID:', emailResult.messageId);

    return NextResponse.json(
      {
        success: true,
        message: `Login credentials sent to ${client.email}`,
        clientName: client.name,
        email: client.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[SEND LOGIN CREDENTIALS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send login credentials', details: String(error) },
      { status: 500 }
    );
  }
}
