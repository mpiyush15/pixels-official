import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const query: any = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const research = await db.collection('client_researches').findOne(query);

    if (!research) {
      return NextResponse.json(
        { error: 'Research record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(research);
  } catch (error) {
    console.error('Error fetching research by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research record' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();

    // Prevent overwriting immutable keys
    delete body._id;
    delete body.clientId;
    delete body.createdAt;

    const updatedData = {
      ...body,
      updatedAt: new Date(),
    };

    const query: any = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

    const result = await db.collection('client_researches').findOneAndUpdate(
      query,
      { $set: updatedData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Research record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      research: result,
    });
  } catch (error) {
    console.error('Error updating research record:', error);
    return NextResponse.json(
      { error: 'Failed to update research record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const query: any = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await db.collection('client_researches').deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Research record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Research record deleted' });
  } catch (error) {
    console.error('Error deleting research record:', error);
    return NextResponse.json(
      { error: 'Failed to delete research record' },
      { status: 500 }
    );
  }
}
