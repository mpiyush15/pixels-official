'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  FileText,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  IndianRupee,
  User,
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  address?: string;
}

interface Project {
  _id: string;
  projectName: string;
  projectType: string;
  description: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  milestones: Array<{
    name: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: string;
  }>;
  createdAt: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue';
  issueDate: string;
  dueDate: string;
  services: Array<{ name: string; quantity: number; price: number }>;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'invoices'>('overview');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/client-auth/session');
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/client-portal/login');
        return;
      }

      setClient(data.client);
      fetchData();
    } catch (error) {
      router.push('/client-portal/login');
    }
  };

  const fetchData = async () => {
    try {
      const [projectsRes, invoicesRes] = await Promise.all([
        fetch('/api/client-portal/projects'),
        fetch('/api/client-portal/invoices'),
      ]);

      // Check for unauthorized access
      if (projectsRes.status === 401 || invoicesRes.status === 401) {
        router.push('/client-portal/login');
        return;
      }

      const projectsData = await projectsRes.json();
      const invoicesData = await invoicesRes.json();

      setProjects(projectsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/client-auth/logout', { method: 'POST' });
    router.push('/client-portal/login');
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'planning': 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      'review': 'bg-purple-100 text-purple-700',
      'completed': 'bg-green-100 text-green-700',
      'on-hold': 'bg-gray-100 text-gray-700',
      'draft': 'bg-gray-100 text-gray-700',
      'sent': 'bg-blue-100 text-blue-700',
      'paid': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
      'overdue': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed' || status === 'paid') return <CheckCircle className="w-4 h-4" />;
    if (status === 'in-progress' || status === 'sent') return <Clock className="w-4 h-4" />;
    if (status === 'overdue' || status === 'on-hold') return <AlertCircle className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-light">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const activeProjects = projects.filter(p => p.status === 'in-progress' || p.status === 'review').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const pendingPayments = invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-light text-black mb-2">
          Welcome back, {client?.name?.split(' ')[0]}!
        </h2>
        <p className="text-gray-600 font-light">
          Here's an overview of your projects and services
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <FolderKanban className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">{activeProjects}</p>
          <p className="text-sm text-gray-600 font-light">Active Projects</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">{completedProjects}</p>
          <p className="text-sm text-gray-600 font-light">Completed Projects</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">{invoices.length}</p>
          <p className="text-sm text-gray-600 font-light">Total Invoices</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <IndianRupee className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">
            ₹{pendingPayments.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-600 font-light">Pending Payments</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-light transition-colors ${
                activeTab === 'overview'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-4 font-light transition-colors ${
                activeTab === 'projects'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-6 py-4 font-light transition-colors ${
                activeTab === 'invoices'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Invoices ({invoices.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Client Info */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-light text-black mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Your Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600 font-light">Name:</span>
                      <p className="text-black font-light">{client?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-light">Email:</span>
                      <p className="text-black font-light">{client?.email}</p>
                    </div>
                    {client?.phone && (
                      <div>
                        <span className="text-gray-600 font-light">Phone:</span>
                        <p className="text-black font-light">{client.phone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600 font-light">Company:</span>
                      <p className="text-black font-light">{client?.company}</p>
                    </div>
                    {client?.address && (
                      <div>
                        <span className="text-gray-600 font-light">Address:</span>
                        <p className="text-black font-light">{client.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-light text-black mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {projects.slice(0, 3).map((project) => (
                      <div key={project._id} className="flex items-start gap-3">
                        <FolderKanban className="w-4 h-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-light text-black">{project.projectName}</p>
                          <p className="text-xs text-gray-600 font-light">
                            {project.progress}% complete
                          </p>
                        </div>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <p className="text-sm text-gray-500 font-light text-center py-4">
                        No projects yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-light">No projects yet</p>
                </div>
              ) : (
                projects.map((project) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-light text-black">
                            {project.projectName}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-light flex items-center gap-1 ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {getStatusIcon(project.status)}
                            {project.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-light mb-3">
                          {project.projectType}
                        </p>
                        <p className="text-sm text-gray-700 font-light">
                          {project.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-light text-black">
                          {project.progress}%
                        </p>
                        <p className="text-xs text-gray-600 font-light">Complete</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Milestones */}
                    {project.milestones && project.milestones.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Milestones:
                        </p>
                        <div className="space-y-2">
                          {project.milestones.map((milestone, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                {milestone.status === 'completed' ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : milestone.status === 'in-progress' ? (
                                  <Clock className="w-4 h-4 text-yellow-600" />
                                ) : (
                                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                                )}
                                <span className="font-light text-gray-700">
                                  {milestone.name}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 font-light">
                                {new Date(milestone.dueDate).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 font-light">
                        <Calendar className="w-4 h-4" />
                        Start: {new Date(project.startDate).toLocaleDateString('en-IN')}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 font-light">
                        <Calendar className="w-4 h-4" />
                        End: {new Date(project.endDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-light">No invoices yet</p>
                </div>
              ) : (
                invoices.map((invoice) => (
                  <motion.div
                    key={invoice._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-light text-black">
                            {invoice.invoiceNumber}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-light flex items-center gap-1 ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {getStatusIcon(invoice.status)}
                            {invoice.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 font-light">
                          <p>
                            Issue Date:{' '}
                            {new Date(invoice.issueDate).toLocaleDateString('en-IN')}
                          </p>
                          <p>
                            Due Date:{' '}
                            {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        {invoice.services && invoice.services.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 font-light mb-1">
                              Services:
                            </p>
                            <div className="space-y-1">
                              {invoice.services.map((service, idx) => (
                                <p
                                  key={idx}
                                  className="text-sm text-gray-700 font-light"
                                >
                                  • {service.name}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-light text-black mb-1">
                          ₹{invoice.total.toLocaleString('en-IN')}
                        </p>
                        {invoice.status === 'sent' && (
                          <p className="text-xs text-orange-600 font-light">
                            Payment Pending
                          </p>
                        )}
                        {invoice.status === 'paid' && (
                          <p className="text-xs text-green-600 font-light">Paid</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <h3 className="text-lg font-light text-black mb-2">Need Help?</h3>
        <p className="text-gray-600 font-light mb-4">
          Our team is here to assist you with any questions
        </p>
        <a
          href="mailto:info@pixelsdigital.tech"
          className="inline-block px-6 py-3 bg-black text-white rounded-xl font-light hover:bg-gray-900 transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
