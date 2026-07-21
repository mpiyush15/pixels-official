'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  FileText,
  CreditCard,
  FolderKanban,
  User,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry?: string;
  address?: string;
  totalRevenue: number;
  projectsCount: number;
  status: string;
}

interface Project {
  _id: string;
  name: string;
  status: string;
  progress: number;
  totalRevenue: number;
  createdAt: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  total: number;
  amountPaid: number;
  status: string;
  issueDate: string;
}

interface Payment {
  _id: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
}

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'payments' | 'contracts'>('overview');

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        // Fetch Client
        const clientRes = await fetch(`/api/clients/${clientId}`);
        if (!clientRes.ok) throw new Error('Client not found');
        const clientData = await clientRes.json();
        
        // Ensure revenue is accurate from DB if possible, or fallback to object prop
        setClient(clientData);

        // Fetch Projects
        const projRes = await fetch('/api/projects');
        const projData = await projRes.json();
        const clientProjects = projData.filter((p: any) => p.clientId === clientId);
        setProjects(clientProjects);

        // Fetch Invoices (Contracts/Billing)
        const invRes = await fetch('/api/invoices');
        const invData = await invRes.json();
        const clientInvoices = invData.filter((i: any) => i.clientId === clientId);
        setInvoices(clientInvoices);

        // Fetch Payments
        const payRes = await fetch('/api/payments');
        const payData = await payRes.json();
        const clientPayments = payData.filter((p: any) => p.clientId === clientId);
        setPayments(clientPayments);

      } catch (err) {
        console.error('Failed to load client data', err);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-text-muted/50" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-medium text-text-primary mb-4">Client not found</h2>
        <button onClick={() => router.back()} className="text-indigo-600 hover:underline">
          Go back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push('/admin/clients')}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center text-3xl font-medium text-text-muted">
              {client.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-medium text-text-primary tracking-tight flex items-center gap-3">
                {client.name}
                <span className={`text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wider ${
                  client.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface text-text-muted'
                }`}>
                  {client.status}
                </span>
              </h1>
              <p className="text-text-muted flex items-center gap-2 mt-2">
                <Building className="w-4 h-4" />
                {client.company}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="text-right">
              <p className="text-sm text-text-muted font-medium">Total Lifetime Value</p>
              <p className="text-2xl font-semibold text-text-primary">₹{client.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', icon: User, label: 'Overview' },
          { id: 'projects', icon: FolderKanban, label: `Projects (${projects.length})` },
          { id: 'contracts', icon: FileText, label: `Invoices (${invoices.length})` },
          { id: 'payments', icon: CreditCard, label: `Payments (${payments.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="ta-card">
              <h3 className="text-lg font-medium text-text-primary mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-text-muted/50" />
                Contact Information
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-surface rounded-lg text-text-muted">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Email Address</p>
                    <p className="font-medium text-text-primary">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-surface rounded-lg text-text-muted">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Phone Number</p>
                    <p className="font-medium text-text-primary">{client.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-surface rounded-lg text-text-muted">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Physical Address</p>
                    <p className="font-medium text-text-primary">{client.address || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-surface rounded-lg text-text-muted">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Industry</p>
                    <p className="font-medium text-text-primary">{client.industry || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="ta-table-container">
            {projects.length === 0 ? (
              <div className="p-12 text-center text-text-muted">No projects found for this client.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="ta-table-header">
                  <tr>
                    <th className="ta-table-th uppercase">Project Name</th>
                    <th className="ta-table-th uppercase">Status</th>
                    <th className="ta-table-th uppercase">Progress</th>
                    <th className="ta-table-th uppercase text-right">Revenue</th>
                    <th className="ta-table-th uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projects.map((project) => (
                    <tr key={project._id} className="hover:bg-surface transition-colors">
                      <td className="ta-table-td font-medium text-text-primary">{project.name}</td>
                      <td className="ta-table-td">
                        <span className="capitalize px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-500">
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="ta-table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-surface/50 rounded-full h-1.5 max-w-[100px]">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                          </div>
                          <span className="text-xs text-text-muted font-medium">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="ta-table-td text-right font-medium text-text-primary">
                        ₹{project.totalRevenue?.toLocaleString('en-IN') || '0'}
                      </td>
                      <td className="ta-table-td text-right">
                        <button onClick={() => router.push(`/admin/projects`)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* CONTRACTS / INVOICES TAB */}
        {activeTab === 'contracts' && (
          <div className="ta-table-container">
            {invoices.length === 0 ? (
              <div className="p-12 text-center text-text-muted">No invoices found for this client.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="ta-table-header">
                  <tr>
                    <th className="ta-table-th uppercase">Invoice #</th>
                    <th className="ta-table-th uppercase">Issue Date</th>
                    <th className="ta-table-th uppercase">Status</th>
                    <th className="ta-table-th uppercase text-right">Amount</th>
                    <th className="ta-table-th uppercase text-right">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-surface transition-colors">
                      <td className="ta-table-td font-medium text-text-primary">{inv.invoiceNumber}</td>
                      <td className="ta-table-td text-sm text-text-muted">{new Date(inv.issueDate).toLocaleDateString()}</td>
                      <td className="ta-table-td">
                        <span className={`capitalize px-2.5 py-1 rounded-full text-xs font-medium ${
                          inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                          inv.status === 'partially_paid' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-surface text-text-muted'
                        }`}>
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="ta-table-td text-right font-medium text-text-primary">
                        ₹{inv.total?.toLocaleString('en-IN')}
                      </td>
                      <td className="ta-table-td text-right text-emerald-500 font-medium">
                        ₹{inv.amountPaid?.toLocaleString('en-IN') || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="ta-table-container">
            {payments.length === 0 ? (
              <div className="p-12 text-center text-text-muted">No payments have been logged for this client yet.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="ta-table-header">
                  <tr>
                    <th className="ta-table-th uppercase">Date</th>
                    <th className="ta-table-th uppercase">Invoice Ref</th>
                    <th className="ta-table-th uppercase">Method</th>
                    <th className="ta-table-th uppercase text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-surface transition-colors">
                      <td className="ta-table-td text-sm text-text-muted">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="ta-table-td font-medium text-text-primary">{payment.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm text-text-muted uppercase tracking-wider text-xs font-medium">{payment.paymentMethod.replace('_', ' ')}</td>
                      <td className="ta-table-td text-right font-semibold text-emerald-500">
                        + ₹{payment.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
