import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Get the lead
    const lead = await db.collection('leads').findOne({
      _id: new ObjectId(leadId),
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Check if lead is already converted
    if (lead.status === 'converted') {
      return NextResponse.json(
        { error: 'Lead is already converted' },
        { status: 400 }
      );
    }

    // Create a new client from the lead
    const client = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || lead.name || 'N/A', // Use name as fallback if no company
      industry: lead.service || '', // Store the service as industry
      address: '',
      status: 'active' as const,
      totalRevenue: 0,
      projectsCount: 0,
      notes: lead.message || '',
      source: lead.source,
      convertedFrom: leadId,
      createdAt: new Date(),
    };

    const clientResult = await db.collection('clients').insertOne(client);

    // Update the lead status to 'converted'
    await db.collection('leads').updateOne(
      { _id: new ObjectId(leadId) },
      {
        $set: {
          status: 'converted',
          convertedAt: new Date(),
          convertedToClientId: clientResult.insertedId.toString(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Lead converted to client successfully',
      clientId: clientResult.insertedId,
    });
  } catch (error) {
    console.error('Error converting lead to client:', error);
    return NextResponse.json(
      { error: 'Failed to convert lead to client' },
      { status: 500 }
    );
  }
}
