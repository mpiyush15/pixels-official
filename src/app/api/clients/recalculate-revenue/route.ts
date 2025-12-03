import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();

    // Get all clients
    const clients = await db.collection('clients').find().toArray();
    
    // Get all invoices
    const invoices = await db.collection('invoices').find().toArray();

    let updatedCount = 0;

    // Recalculate revenue for each client
    for (const client of clients) {
      // Calculate total revenue from ONLY paid invoices
      const clientRevenue = invoices
        .filter(inv => 
          inv.clientId === client._id.toString() && 
          inv.status === 'paid'
        )
        .reduce((sum, inv) => sum + (inv.total || 0), 0);

      // Update client's totalRevenue
      await db.collection('clients').updateOne(
        { _id: client._id },
        { 
          $set: { 
            totalRevenue: clientRevenue 
          }
        }
      );

      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully recalculated revenue for ${updatedCount} clients`,
      updatedCount
    });
  } catch (error) {
    console.error('Error recalculating client revenue:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate client revenue' },
      { status: 500 }
    );
  }
}
