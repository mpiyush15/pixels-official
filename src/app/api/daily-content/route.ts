import { NextRequest, NextResponse } from 'next/server';
import { createDailyContent, getAllDailyContent, getDailyContentByClient, deleteDailyContent } from '@/lib/staff';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this');

async function getStaffFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get('staff-token')?.value;
    if (!token) return null;
    
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// GET all daily content or by client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let content;
    if (clientId) {
      content = await getDailyContentByClient(clientId);
    } else {
      content = await getAllDailyContent();
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching daily content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// POST create new daily content
export async function POST(request: NextRequest) {
  try {
    const staff = await getStaffFromToken(request);
    
    if (!staff) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, type, clientId, clientName, driveFileId, driveFileUrl, description } = body;

    if (!name || !type || !clientId || !clientName || !driveFileId || !driveFileUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newContent = await createDailyContent({
      name,
      type,
      clientId,
      clientName,
      createdBy: staff.staffId as string,
      createdByName: staff.name as string,
      driveFileId,
      driveFileUrl,
      description,
    });

    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error('Error creating daily content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

// DELETE daily content
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteDailyContent(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
