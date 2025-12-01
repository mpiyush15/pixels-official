import { NextRequest, NextResponse } from 'next/server';
import { createStaff, getAllStaff, updateStaff, deleteStaff } from '@/lib/staff';

// GET all staff
export async function GET() {
  try {
    const staff = await getAllStaff();
    
    // Remove passwords from response
    const sanitizedStaff = staff.map(s => {
      const { password, ...rest } = s;
      return rest;
    });
    
    return NextResponse.json(sanitizedStaff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// POST create new staff
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, assignedClients } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    const newStaff = await createStaff({
      name,
      email,
      password,
      role,
      assignedClients: assignedClients || [],
      isActive: true,
    });

    const { password: _, ...staffWithoutPassword } = newStaff;
    return NextResponse.json(staffWithoutPassword, { status: 201 });
  } catch (error: any) {
    console.error('Error creating staff:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create staff' },
      { status: 500 }
    );
  }
}

// PUT update staff
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      );
    }

    const success = await updateStaff(id, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: 'Failed to update staff' },
      { status: 500 }
    );
  }
}

// DELETE staff
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteStaff(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff' },
      { status: 500 }
    );
  }
}
