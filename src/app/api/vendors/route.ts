import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const vendors = await db
      .collection('vendors')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const vendor = {
      name: body.name,
      company: body.company || '',
      email: body.email || '',
      phone: body.phone || '',
      category: body.category, // hosting, domain, internet, social_media, communication, software, other
      description: body.description || '',
      website: body.website || '',
      contactPerson: body.contactPerson || '',
      address: body.address || '',
      status: body.status || 'active',
      totalPaid: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('vendors').insertOne(vendor);

    return NextResponse.json({
      success: true,
      vendorId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}
