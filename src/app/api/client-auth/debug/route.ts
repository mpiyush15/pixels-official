import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * Debug endpoint to check client login status
 * GET /api/client-auth/debug?email=client@email.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const client = await db.collection('clients').findOne({ email });

    if (!client) {
      return NextResponse.json({
        found: false,
        message: 'Client not found with this email'
      });
    }

    return NextResponse.json({
      found: true,
      hasPassword: !!client.password,
      status: client.status || 'active',
      email: client.email,
      name: client.name,
      company: client.company,
      passwordLength: client.password ? client.password.length : 0,
      createdAt: client.createdAt
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug check failed' },
      { status: 500 }
    );
  }
}
