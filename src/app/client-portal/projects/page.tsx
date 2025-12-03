'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  Download,
  MessageCircle,
  X,
  Upload,
  Lock,
  Unlock,
  IndianRupee,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ProjectChat from '@/components/ProjectChat';
import WorkSubmissionForm from '@/components/WorkSubmissionForm';

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
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: string;
    amount?: number;
    paymentStatus?: 'unpaid' | 'paid';
    paidAt?: string;
    paidAmount?: number;
    fileUrl?: string;
    fileKey?: string;
    fileName?: string;
    fileSize?: number;
    uploadedAt?: string;
  }>;
  createdAt: string;
}

export default function ClientProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [clientInfo, setClientInfo] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [activeChatProject, setActiveChatProject] = useState<Project | null>(null);
  const [activeSubmissionProject, setActiveSubmissionProject] = useState<Project | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    checkAuth();
  }, []);

  const toggleProjectMilestones = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/client-auth/session');
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/client-portal/login');
        return;
      }

      setClientInfo({
        id: data.client.id,
        name: data.client.name,
        email: data.client.email,
      });

      fetchProjects();
    } catch (error) {
      router.push('/client-portal/login');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/client-portal/projects');
      const data = await response.json();
      
      if (response.status === 401) {
        router.push('/client-portal/login');
        return;
      }
      
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMilestonePayment = async (projectId: string, milestoneIndex: number, amount: number) => {
    try {
      // Create payment order for milestone
      const response = await fetch('/api/payments/milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          milestoneIndex,
          amount,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // Redirect to Cashfree payment page
        window.location.href = data.paymentUrl;
      } else {
        alert('Failed to initiate payment: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'planning': 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      'review': 'bg-purple-100 text-purple-700',
      'completed': 'bg-green-100 text-green-700',
      'on-hold': 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (status === 'in-progress' || status === 'review') return <Clock className="w-4 h-4" />;
    if (status === 'on-hold') return <AlertCircle className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'active') return project.status === 'in-progress' || project.status === 'review';
    if (filter === 'completed') return project.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-black mb-2">Your Projects</h1>
        <p className="text-gray-600 font-light">
          Track the progress of all your projects
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">
            {projects.filter(p => p.status === 'in-progress' || p.status === 'review').length}
          </p>
          <p className="text-sm text-gray-600 font-light">Active Projects</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">
            {projects.filter(p => p.status === 'completed').length}
          </p>
          <p className="text-sm text-gray-600 font-light">Completed Projects</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <FolderKanban className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">{projects.length}</p>
          <p className="text-sm text-gray-600 font-light">Total Projects</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-xl font-light transition-colors ${
            filter === 'all'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Projects ({projects.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-6 py-2 rounded-xl font-light transition-colors ${
            filter === 'active'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Active ({projects.filter(p => p.status === 'in-progress' || p.status === 'review').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-6 py-2 rounded-xl font-light transition-colors ${
            filter === 'completed'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Completed ({projects.filter(p => p.status === 'completed').length})
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-light">No projects found</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
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
                  <button
                    onClick={() => toggleProjectMilestones(project._id)}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3 hover:text-black transition-colors"
                  >
                    <span>Milestones ({project.milestones.length})</span>
                    {expandedProjects[project._id] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  
                  {expandedProjects[project._id] && (
                  <div className="space-y-3">
                    {project.milestones.map((milestone, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {milestone.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : milestone.status === 'in-progress' ? (
                                <Clock className="w-4 h-4 text-yellow-600" />
                              ) : milestone.paymentStatus === 'paid' ? (
                                <Unlock className="w-4 h-4 text-green-600" />
                              ) : milestone.amount && milestone.amount > 0 ? (
                                <Lock className="w-4 h-4 text-red-600" />
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                              )}
                              <span className="font-light text-gray-700 text-sm">
                                {milestone.name}
                              </span>
                              {milestone.amount && milestone.amount > 0 && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <IndianRupee className="w-3 h-3" />
                                  {milestone.amount.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-light ${
                              milestone.status === 'completed' 
                                ? 'bg-green-100 text-green-700' 
                                : milestone.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-700'
                                : milestone.paymentStatus === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {milestone.paymentStatus === 'paid' && milestone.status === 'pending' 
                                ? 'Paid - Pending Start'
                                : milestone.status === 'in-progress'
                                ? 'In Progress'
                                : milestone.status === 'completed'
                                ? 'Completed'
                                : milestone.amount && milestone.amount > 0
                                ? 'Payment Required'
                                : 'Pending'}
                            </span>
                          </div>
                          
                          {milestone.description && (
                            <p className="text-xs text-gray-600 font-light mt-1 mb-2">
                              {milestone.description}
                            </p>
                          )}

                          {/* Payment Status */}
                          {milestone.amount && milestone.amount > 0 && milestone.paymentStatus !== 'paid' && (
                            <div className="mt-3 mb-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-yellow-800 mb-1 flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Payment Required
                                  </p>
                                  <p className="text-xs text-yellow-700">
                                    Pay ₹{milestone.amount.toLocaleString()} to unlock this milestone
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleMilestonePayment(project._id, idx, milestone.amount!)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-light whitespace-nowrap"
                                >
                                  <IndianRupee className="w-4 h-4" />
                                  Pay Now
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Payment Confirmation */}
                          {milestone.paymentStatus === 'paid' && (
                            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
                              <p className="text-xs text-green-700 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Paid on {new Date(milestone.paidAt!).toLocaleDateString('en-IN')}
                                {milestone.paidAmount && ` - ₹${milestone.paidAmount.toLocaleString()}`}
                              </p>
                            </div>
                          )}

                          {/* Milestone Dates */}
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 font-light mt-2 pt-2 border-t border-gray-200">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {new Date(milestone.dueDate).toLocaleDateString('en-IN')}</span>
                            </div>
                          </div>

                          {/* File */}
                          {milestone.fileUrl && (
                          <div className="mt-2 flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-light text-gray-700 truncate">
                                {milestone.fileName || 'Attached Document'}
                              </p>
                              {milestone.fileSize && (
                                <p className="text-xs text-gray-500">
                                  {(milestone.fileSize / 1024).toFixed(1)} KB
                                </p>
                              )}
                            </div>
                            <a
                              href={milestone.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                              title="Download document"
                            >
                              <Download className="w-4 h-4 text-blue-600" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              )}

              {/* Dates and Actions */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 text-sm flex-wrap">
                <div className="flex items-center gap-2 text-gray-600 font-light">
                  <Calendar className="w-4 h-4" />
                  Start: {new Date(project.startDate).toLocaleDateString('en-IN')}
                </div>
                <div className="flex items-center gap-2 text-gray-600 font-light">
                  <Calendar className="w-4 h-4" />
                  End: {new Date(project.endDate).toLocaleDateString('en-IN')}
                </div>
                <div className="ml-auto flex gap-2">
                  {(() => {
                    // Check if any milestone is locked (has amount > 0 and unpaid)
                    const hasLockedMilestone = project.milestones?.some(
                      m => m.amount && m.amount > 0 && m.paymentStatus !== 'paid'
                    );

                    if (hasLockedMilestone) {
                      return (
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2 opacity-50">
                            <button
                              disabled
                              className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed flex items-center gap-2 text-sm font-light"
                              title="Complete milestone payments to unlock"
                            >
                              <Lock className="w-4 h-4" />
                              Submit Work
                            </button>
                            <button
                              disabled
                              className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed flex items-center gap-2 text-sm font-light"
                              title="Complete milestone payments to unlock"
                            >
                              <Lock className="w-4 h-4" />
                              Chat
                            </button>
                          </div>
                          <p className="text-xs text-red-600 font-light flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Pay for locked milestones to unlock features
                          </p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <button
                          onClick={() => setActiveSubmissionProject(project)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-light"
                        >
                          <Upload className="w-4 h-4" />
                          Submit Work
                        </button>
                        <button
                          onClick={() => setActiveChatProject(project)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-light"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Work Submission Modal */}
      <AnimatePresence>
        {activeSubmissionProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSubmissionProject(null)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
            >
              <div className="relative">
                <button
                  onClick={() => setActiveSubmissionProject(null)}
                  className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
                <WorkSubmissionForm
                  projectId={activeSubmissionProject._id}
                  projectName={activeSubmissionProject.projectName}
                  onSubmitSuccess={() => {
                    setActiveSubmissionProject(null);
                    fetchProjects(); // Refresh to show new submission
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {activeChatProject && clientInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveChatProject(null)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl"
            >
              <div className="relative">
                <button
                  onClick={() => setActiveChatProject(null)}
                  className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
                <ProjectChat
                  projectId={activeChatProject._id}
                  projectName={activeChatProject.projectName}
                  clientId={clientInfo.id}
                  clientName={clientInfo.name}
                  clientEmail={clientInfo.email}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
