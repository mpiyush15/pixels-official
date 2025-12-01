import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    // Get current month stats
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total counts - only development clients
    const totalLeads = await db.collection('leads').countDocuments();
    const totalClients = await db.collection('clients').countDocuments({
      $or: [
        { clientType: 'development' },
        { clientType: { $exists: false } }
      ]
    });
    const totalInvoices = await db.collection('invoices').countDocuments();

    // Current month stats
    const currentMonthLeads = await db.collection('leads').countDocuments({
      createdAt: { $gte: firstDayOfMonth }
    });
    const lastMonthLeads = await db.collection('leads').countDocuments({
      createdAt: { $gte: lastMonth, $lt: firstDayOfMonth }
    });

    const currentMonthClients = await db.collection('clients').countDocuments({
      createdAt: { $gte: firstDayOfMonth },
      $or: [
        { clientType: 'development' },
        { clientType: { $exists: false } }
      ]
    });
    const lastMonthClients = await db.collection('clients').countDocuments({
      createdAt: { $gte: lastMonth, $lt: firstDayOfMonth },
      $or: [
        { clientType: 'development' },
        { clientType: { $exists: false } }
      ]
    });

    // Calculate total revenue
    const invoices = await db.collection('invoices')
      .find({ status: 'paid' })
      .toArray();
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

    const currentMonthRevenue = invoices
      .filter(inv => new Date(inv.paidAt || inv.createdAt) >= firstDayOfMonth)
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    const lastMonthRevenue = invoices
      .filter(inv => {
        const date = new Date(inv.paidAt || inv.createdAt);
        return date >= lastMonth && date < firstDayOfMonth;
      })
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    // Calculate percentage changes
    const leadsChange = lastMonthLeads === 0 ? 100 : 
      Math.round(((currentMonthLeads - lastMonthLeads) / lastMonthLeads) * 100);
    const clientsChange = lastMonthClients === 0 ? 100 : 
      Math.round(((currentMonthClients - lastMonthClients) / lastMonthClients) * 100);
    const revenueChange = lastMonthRevenue === 0 ? 100 : 
      Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

    return NextResponse.json({
      totalLeads,
      totalClients,
      totalInvoices,
      totalRevenue,
      leadsChange,
      clientsChange,
      revenueChange,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
