'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, User, FileText, Clock, CheckCircle, XCircle,
  Download, MessageSquare, AlertCircle, Upload, Eye, CheckCircle2
} from 'lucide-react';
import AdminTopBar from '@/components/AdminTopBar';
import FileThumbnail from '@/components/FileThumbnail';
import FilePreviewModal from '@/components/FilePreviewModal';
import RevisionHistoryTable from '@/components/RevisionHistoryTable';

interface Task {
  _id: string;
  title: string;
  description: string;
  projectName?: string;
  clientName: string;
  assignedToName: string;
  assignedToRole: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'submitted' | 'approved' | 'revision-needed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  startDate?: string;
  completedDate?: string;
  submittedDate?: string;
  approvedDate?: string;
  files: Array<{
    name: string;
    url: string;
    key: string;
    size: number;
    uploadedAt: Date;
  }>;
  submissionNotes?: string;
  adminNotes?: string;
  revisionReason?: string;
  createdAt: string;
  createdByName: string;
  submissionHistory?: Array<{
    revisionNumber: number;
    submittedAt: Date | string;
    submittedBy: string;
    submittedByName: string;
    notes: string;
    files: Array<{
      name: string;
      url: string;
      key?: string;
      size?: number;
    }>;
    status: 'pending-review' | 'approved' | 'revision-requested';
    adminNotes?: string;
    adminAction?: {
      by: string;
      byName: string;
      at: Date | string;
    };
  }>;
}

interface RevisionHistory {
  date: Date;
  action: 'submitted' | 'revision-needed' | 'approved';
  notes?: string;
  files?: Array<{ name: string; url: string }>;
}

export default function AdminTaskReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [revisionReason, setRevisionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    url: string;
    key: string;
    size: number;
  } | null>(null);

  useEffect(() => {
    fetchTask();
  }, []);

  const fetchTask = async () => {
    try {
      console.log('🔍 Fetching task from single task API:', params.id);
      
      const response = await fetch(`/api/admin/tasks/${params.id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('❌ Failed to fetch task:', response.status);
        throw new Error('Failed to fetch task');
      }

      const data = await response.json();
      console.log('✅ Task fetched successfully:', {
        taskId: data.task._id,
        title: data.task.title,
        filesCount: data.task.files?.length || 0,
        submissionHistoryCount: data.task.submissionHistory?.length || 0,
      });

      // Log submission history files
      if (data.task.submissionHistory?.length > 0) {
        console.log('📋 Submission History in UI:');
        data.task.submissionHistory.forEach((sub: any) => {
          console.log(`  Revision #${sub.revisionNumber}:`, {
            filesCount: sub.files?.length || 0,
            files: sub.files?.map((f: any) => f.name),
            status: sub.status,
          });
        });
      }

      setTask(data.task);
      setAdminNotes(data.task.adminNotes || '');
      setRevisionReason(data.task.revisionReason || '');
    } catch (error) {
      console.error('❌ Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!task) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/tasks/${task._id}/submission`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          notes: adminNotes,
        }),
      });

      if (response.ok) {
        alert('Task approved successfully!');
        router.push('/admin/tasks');
      } else {
        alert('Failed to approve task');
      }
    } catch (error) {
      console.error('Error approving task:', error);
      alert('Error approving task');
    } finally {
      setProcessing(false);
      setShowApproveModal(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!task) return;

    if (!revisionReason.trim()) {
      alert('Please provide a reason for revision');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/tasks/${task._id}/submission`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request-revision',
          notes: revisionReason,
        }),
      });

      if (response.ok) {
        alert('Revision request sent to staff member');
        router.push('/admin/tasks');
      } else {
        alert('Failed to request revision');
      }
    } catch (error) {
      console.error('Error requesting revision:', error);
      alert('Error requesting revision');
    } finally {
      setProcessing(false);
      setShowRevisionModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-700 border-blue-200',
      'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      submitted: 'bg-purple-100 text-purple-700 border-purple-200',
      approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'revision-needed': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading task...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Task not found</div>
      </div>
    );
  }

  const canReview = task.status === 'submitted';

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminTopBar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/tasks')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Tasks</span>
        </button>

        {/* Task Title & Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white mb-2">{task.title}</h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)} bg-white`}>
                {task.status.replace('-', ' ').toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                {task.priority.toUpperCase()} PRIORITY
              </span>
              {canReview && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900">
                  AWAITING REVIEW
                </span>
              )}
            </div>
          </div>

          {/* Task Details Table */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Task Details
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-500 w-1/3">Client</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{task.clientName}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-500">Assigned To</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{task.assignedToName}</div>
                        <div className="text-xs text-gray-500">{task.assignedToRole}</div>
                      </div>
                    </td>
                  </tr>
                  {task.projectName && (
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-500">Project</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{task.projectName}</td>
                    </tr>
                  )}
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-500">Status</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('-', ' ').charAt(0).toUpperCase() + task.status.replace('-', ' ').slice(1)}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-500">Priority</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-500">Due Date</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={new Date(task.dueDate) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                        {new Date(task.dueDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        {new Date(task.dueDate) < new Date() && ' ⚠️ Overdue'}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-500">Created By</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{task.createdByName}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-500">Created On</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(task.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                  {task.startDate && (
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-500">Started On</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(task.startDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  )}
                  {task.submittedDate && (
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-500">Submitted On</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(task.submittedDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  )}
                  {task.approvedDate && (
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-500">Approved On</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(task.approvedDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  )}
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-500 align-top">Description</td>
                    <td className="py-3 px-4 text-sm text-gray-900 whitespace-pre-wrap">{task.description}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Revision History Table - Shows all submissions */}
        {task.submissionHistory && task.submissionHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <RevisionHistoryTable 
              submissions={task.submissionHistory}
              onFileClick={(file) => setPreviewFile(file as any)}
              viewType="admin"
            />
          </motion.div>
        )}

        {/* No Submissions Message */}
        {(!task.submissionHistory || task.submissionHistory.length === 0) && task.status !== 'assigned' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 border border-gray-200 rounded-xl p-12 mb-6 text-center"
          >
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No submissions yet</p>
            <p className="text-sm text-gray-500 mt-1">Waiting for staff to submit their work</p>
          </motion.div>
        )}

        {/* Review Actions */}
        {canReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Review Submission
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowApproveModal(true)}
                className="flex items-center px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Task
              </button>
              <button
                onClick={() => setShowRevisionModal(true)}
                className="flex items-center px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Request Revision
              </button>
              <button
                onClick={() => router.back()}
                className="flex items-center px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
              </button>
            </div>
          </motion.div>
        )}

        {/* Task Already Approved */}
        {task.status === 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-green-900">Task Approved</h3>
                <p className="text-sm text-green-700">
                  This task was approved on {task.approvedDate && new Date(task.approvedDate).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Approve Task</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve this task? The staff member will be notified.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Add any comments or feedback..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Approving...' : 'Approve Task'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Request Revision</h3>
            <p className="text-gray-600 mb-4">
              Please provide specific feedback on what needs to be revised.
            </p>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revision Reason *
                </label>
                <textarea
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Explain what needs to be changed or improved..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Any additional comments..."
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={processing || !revisionReason.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {processing ? 'Sending...' : 'Request Revision'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
