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

    // Get all invoices for detailed revenue analysis
    const allInvoices = await db.collection('invoices').find().toArray();
    
    // Revenue from PAID invoices only
    const paidInvoices = allInvoices.filter(inv => inv.status === 'paid');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    // Outstanding dues (sent + overdue invoices)
    const unpaidInvoices = allInvoices.filter(inv => 
      inv.status === 'sent' || inv.status === 'overdue'
    );
    const totalDues = unpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    // Draft invoices value
    const draftInvoices = allInvoices.filter(inv => inv.status === 'draft');
    const draftValue = draftInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    // This month's revenue
    const currentMonthRevenue = paidInvoices
      .filter(inv => new Date(inv.paidAt || inv.createdAt) >= firstDayOfMonth)
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    const lastMonthRevenue = paidInvoices
      .filter(inv => {
        const date = new Date(inv.paidAt || inv.createdAt);
        return date >= lastMonth && date < firstDayOfMonth;
      })
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    // Overdue amount (critical)
    const overdueInvoices = allInvoices.filter(inv => inv.status === 'overdue');
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    // Active projects
    const activeProjects = await db.collection('projects').countDocuments({
      status: { $in: ['in-progress', 'review'] }
    });
    
    // Total projects and their revenue
    const allProjects = await db.collection('projects').find().toArray();
    const totalProjects = allProjects.length;
    const totalProjectsRevenue = allProjects.reduce((sum, proj) => sum + (proj.budget || 0), 0);

    // Calculate percentage changes
    const revenueChange = lastMonthRevenue === 0 ? (currentMonthRevenue > 0 ? 100 : 0) : 
      Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

    return NextResponse.json({
      // Revenue metrics
      totalRevenue,
      currentMonthRevenue,
      totalDues,
      overdueAmount,
      draftValue,
      
      // Invoice counts
      totalInvoices: allInvoices.length,
      paidInvoices: paidInvoices.length,
      unpaidInvoices: unpaidInvoices.length,
      overdueInvoices: overdueInvoices.length,
      draftInvoices: draftInvoices.length,
      
      // Business metrics
      totalClients,
      activeProjects,
      totalProjects,
      totalProjectsRevenue,
      totalLeads,
      
      // Changes
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
