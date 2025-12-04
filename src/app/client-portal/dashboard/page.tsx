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
  Key,
  X,
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
    _id?: string;
    name?: string;
    title?: string;
    status?: 'pending' | 'in-progress' | 'completed';
    paymentStatus?: 'unpaid' | 'paid';
    completed?: boolean;
    dueDate: string;
    amount?: number;
  }>;
  createdAt: string;
  requiresDepositPayment?: boolean;
  depositPaid?: boolean;
  amount?: number;
  title?: string;
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

interface WorkSubmission {
  _id: string;
  title: string;
  description: string;
  workType: string;
  fileUrl?: string;
  fileName?: string;
  fileKey?: string;
  fileSize?: number;
  notes?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'needs-revision';
  submittedAt: string;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'invoices'>('overview');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

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
      const [projectsRes, invoicesRes, submissionsRes] = await Promise.all([
        fetch('/api/client-portal/projects'),
        fetch('/api/client-portal/invoices'),
        fetch('/api/client-portal/submit-work'),
      ]);

      // Check for unauthorized access
      if (projectsRes.status === 401 || invoicesRes.status === 401 || submissionsRes.status === 401) {
        router.push('/client-portal/login');
        return;
      }

      const projectsData = await projectsRes.json();
      const invoicesData = await invoicesRes.json();
      const submissionsData = await submissionsRes.json();

      setProjects(projectsData);
      setInvoices(invoicesData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/client-portal/submit-work/${submissionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh submissions
        fetchData();
      } else {
        alert('Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/client-auth/logout', { method: 'POST' });
    router.push('/client-portal/login');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/client-auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordSuccess('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(data.error || 'Failed to update password');
      }
    } catch (error) {
      setPasswordError('An error occurred. Please try again.');
    }
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
  const totalProjectsCost = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <div className="p-4 md:p-8">
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-light text-black mb-2">
          Welcome back, {client?.name?.split(' ')[0]}!
        </h2>
        <p className="text-sm md:text-base text-gray-600 font-light">
          Here's an overview of your projects and services
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <FolderKanban className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
          </div>
          <p className="text-2xl md:text-3xl font-light text-black mb-1">{activeProjects}</p>
          <p className="text-xs md:text-sm text-gray-600 font-light">Active Projects</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
          </div>
          <p className="text-xl md:text-3xl font-light text-black mb-1">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <p className="text-xs md:text-sm text-gray-600 font-light">Paid Amounts</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <IndianRupee className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
          </div>
          <p className="text-xl md:text-3xl font-light text-black mb-1">
            ₹{totalProjectsCost.toLocaleString('en-IN')}
          </p>
          <p className="text-xs md:text-sm text-gray-600 font-light">Total Projects Cost</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <FileText className="w-6 h-6 md:w-8 md:h-8 text-cyan-600" />
          </div>
          <p className="text-2xl md:text-3xl font-light text-black mb-1">{invoices.length}</p>
          <p className="text-xs md:text-sm text-gray-600 font-light">Total Invoices</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6 md:mb-8">
        <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 md:px-6 py-3 md:py-4 font-light transition-colors text-sm md:text-base whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 md:px-6 py-3 md:py-4 font-light transition-colors text-sm md:text-base whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 md:px-6 py-3 md:py-4 font-light transition-colors text-sm md:text-base whitespace-nowrap ${
                activeTab === 'invoices'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Invoices ({invoices.length})
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Client Info */}
                <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-light text-black mb-3 md:mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                    Your Information
                  </h3>
                  <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                    <div>
                      <span className="text-gray-600 font-light">Name:</span>
                      <p className="text-black font-light break-words">{client?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-light">Email:</span>
                      <p className="text-black font-light break-all">{client?.email}</p>
                    </div>
                    {client?.phone && (
                      <div>
                        <span className="text-gray-600 font-light">Phone:</span>
                        <p className="text-black font-light">{client.phone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600 font-light">Company:</span>
                      <p className="text-black font-light break-words">{client?.company}</p>
                    </div>
                    {client?.address && (
                      <div>
                        <span className="text-gray-600 font-light">Address:</span>
                        <p className="text-black font-light break-words">{client.address}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Reset Password Button */}
                  <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-light text-sm"
                    >
                      <Key className="w-4 h-4" />
                      Reset Password
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-light text-black mb-3 md:mb-4">Recent Activity</h3>
                  <div className="space-y-2 md:space-y-3">
                    {projects.slice(0, 3).map((project) => (
                      <div key={project._id} className="flex items-start gap-2 md:gap-3">
                        <FolderKanban className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-light text-black truncate">{project.projectName}</p>
                          <p className="text-xs text-gray-600 font-light">
                            {project.progress}% complete
                          </p>
                        </div>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <p className="text-xs md:text-sm text-gray-500 font-light text-center py-4">
                        No projects yet
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submitted Work Section */}
              <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-light text-black">Your Submitted Work</h3>
                  <button
                    onClick={() => router.push('/client-portal/submit-work')}
                    className="w-full sm:w-auto px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs md:text-sm font-light whitespace-nowrap"
                  >
                    + Submit New Work
                  </button>
                </div>
                
                {submissions.length === 0 ? (
                  <div className="text-center py-6 md:py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 font-light text-xs md:text-sm px-4">
                      No work submitted yet. Submit your work to get started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {submissions.slice(0, 5).map((submission) => (
                      <div
                        key={submission._id}
                        className="flex items-start gap-2 md:gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            submission.status === 'approved'
                              ? 'bg-green-500'
                              : submission.status === 'needs-revision'
                              ? 'bg-yellow-500'
                              : submission.status === 'reviewed'
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs md:text-sm font-medium text-black truncate">
                                {submission.title}
                              </h4>
                              <p className="text-xs text-gray-600 font-light mt-0.5">
                                {submission.workType.charAt(0).toUpperCase() + submission.workType.slice(1).replace('-', ' ')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span
                                className={`px-2 py-0.5 md:py-1 rounded-full text-xs font-light whitespace-nowrap ${
                                  submission.status === 'approved'
                                    ? 'bg-green-100 text-green-700'
                                    : submission.status === 'needs-revision'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : submission.status === 'reviewed'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {submission.status.replace('-', ' ').charAt(0).toUpperCase() + submission.status.slice(1).replace('-', ' ')}
                              </span>
                              <button
                                onClick={() => handleDeleteSubmission(submission._id)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                title="Delete submission"
                              >
                                <X className="w-3 h-3 md:w-4 md:h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 font-light mt-1">
                            Submitted {new Date(submission.submittedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {submissions.length > 5 && (
                      <p className="text-xs text-gray-500 font-light text-center pt-2">
                        + {submissions.length - 5} more submissions
                      </p>
                    )}
                  </div>
                )}
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
                projects.map((project) => {
                  const projectName = project.projectName || project.title || 'Untitled Project';
                  const requiresPayment = project.requiresDepositPayment && !project.depositPaid;
                  const depositMilestone = requiresPayment ? project.milestones?.find(m => m.paymentStatus === 'unpaid') : null;
                  
                  return (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-gray-50 rounded-xl p-6 ${requiresPayment ? 'border-2 border-orange-300' : ''}`}
                    >
                      {requiresPayment && (
                        <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <p className="text-sm text-orange-800 font-light">
                            <strong>Payment Required:</strong> This project requires a deposit payment of ₹{depositMilestone?.amount?.toLocaleString('en-IN')} to unlock access.
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-light text-black">
                              {projectName}
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
                          {project.projectType && (
                            <p className="text-sm text-gray-600 font-light mb-3">
                              {project.projectType}
                            </p>
                          )}
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

                      {requiresPayment ? (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-black mb-1">Deposit Payment Required</p>
                              <p className="text-xs text-gray-600 font-light">
                                Amount: ₹{depositMilestone?.amount?.toLocaleString('en-IN')}
                              </p>
                            </div>
                            <button
                              onClick={() => router.push(`/client-portal/projects?project=${project._id}`)}
                              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-light"
                            >
                              Pay Now
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
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
                                {project.milestones.map((milestone, idx) => {
                                  const milestoneName = milestone.name || milestone.title || `Milestone ${idx + 1}`;
                                  const isCompleted = milestone.status === 'completed' || milestone.completed;
                                  const isInProgress = milestone.status === 'in-progress';
                                  
                                  return (
                                    <div
                                      key={milestone._id || idx}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        {isCompleted ? (
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : isInProgress ? (
                                          <Clock className="w-4 h-4 text-yellow-600" />
                                        ) : (
                                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                                        )}
                                        <span className="font-light text-gray-700">
                                          {milestoneName}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-500 font-light">
                                        {new Date(milestone.dueDate).toLocaleDateString('en-IN')}
                                      </span>
                                    </div>
                                  );
                                })}
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
                        </>
                      )}
                    </motion.div>
                  );
                })
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
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 text-center">
        <h3 className="text-base md:text-lg font-light text-black mb-2">Need Help?</h3>
        <p className="text-xs md:text-base text-gray-600 font-light mb-3 md:mb-4 px-2">
          Our team is here to assist you with any questions
        </p>
        <a
          href="mailto:info@pixelsdigital.tech"
          className="inline-block px-5 md:px-6 py-2.5 md:py-3 bg-black text-white rounded-xl font-light hover:bg-gray-900 transition-colors text-sm md:text-base"
        >
          Contact Support
        </a>
      </div>

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowPasswordModal(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-black flex items-center gap-2">
                  <Key className="w-6 h-6" />
                  Reset Password
                </h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordSuccess('');
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    placeholder="Enter new password (min 6 characters)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-light">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm font-light">
                    {passwordSuccess}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordError('');
                      setPasswordSuccess('');
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-black rounded-xl font-light hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-light hover:bg-gray-800 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
