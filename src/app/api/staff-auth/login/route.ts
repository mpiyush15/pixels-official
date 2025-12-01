import { NextRequest, NextResponse } from 'next/server';
import { verifyStaffPassword } from '@/lib/staff';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this');

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const staff = await verifyStaffPassword(email, password);

    if (!staff) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!staff.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive. Contact admin.' },
        { status: 403 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({
      staffId: staff._id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        assignedClients: staff.assignedClients,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set('staff-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Staff login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
