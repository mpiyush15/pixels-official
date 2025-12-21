'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, User, FileText, Clock, CheckCircle, XCircle,
  Download, MessageSquare, AlertCircle, Upload, Eye
} from 'lucide-react';
import AdminTopBar from '@/components/AdminTopBar';
import FileThumbnail from '@/components/FileThumbnail';
import FilePreviewModal from '@/components/FilePreviewModal';

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
      const response = await fetch(`/api/tasks?taskId=${params.id}`);
      if (response.ok) {
        const tasks = await response.json();
        const currentTask = tasks.find((t: Task) => t._id === params.id);
        if (currentTask) {
          setTask(currentTask);
          setAdminNotes(currentTask.adminNotes || '');
          setRevisionReason(currentTask.revisionReason || '');
        }
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!task) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task._id,
          updates: {
            status: 'approved',
            adminNotes,
            approvedDate: new Date(),
          },
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
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task._id,
          updates: {
            status: 'revision-needed',
            revisionReason,
            adminNotes,
          },
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
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Tasks</span>
        </button>

        {/* Task Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()} PRIORITY
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-semibold text-gray-900">{task.clientName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="font-semibold text-gray-900">{task.assignedToName}</p>
                <p className="text-xs text-gray-500">{task.assignedToRole}</p>
              </div>
            </div>
            {task.projectName && (
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Project</p>
                  <p className="font-semibold text-gray-900">{task.projectName}</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className={`font-semibold ${new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 font-medium">{new Date(task.createdAt).toLocaleString()}</span>
              </div>
              {task.startDate && (
                <div>
                  <span className="text-gray-500">Started:</span>
                  <span className="ml-2 font-medium">{new Date(task.startDate).toLocaleString()}</span>
                </div>
              )}
              {task.submittedDate && (
                <div>
                  <span className="text-gray-500">Submitted:</span>
                  <span className="ml-2 font-medium">{new Date(task.submittedDate).toLocaleString()}</span>
                </div>
              )}
              {task.approvedDate && (
                <div>
                  <span className="text-gray-500">Approved:</span>
                  <span className="ml-2 font-medium">{new Date(task.approvedDate).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Task Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Task Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
        </motion.div>

        {/* Submitted Work */}
        {task.submissionNotes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6"
          >
            <div className="flex items-start space-x-3">
              <MessageSquare className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-purple-900 mb-2">Staff Submission Notes</h3>
                <p className="text-purple-800 whitespace-pre-wrap">{task.submissionNotes}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submitted Files */}
        {task.files && task.files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Upload className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Submitted Files</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {task.files.map((file, index) => (
                <FileThumbnail
                  key={index}
                  file={file}
                  onClick={() => setPreviewFile(file)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Current Admin Notes */}
        {task.adminNotes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
          >
            <h3 className="text-lg font-bold text-blue-900 mb-2">Your Previous Notes</h3>
            <p className="text-blue-800 whitespace-pre-wrap">{task.adminNotes}</p>
          </motion.div>
        )}

        {/* Revision Reason */}
        {task.revisionReason && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">Previous Revision Request</h3>
                <p className="text-red-800 whitespace-pre-wrap">{task.revisionReason}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Review Actions */}
        {canReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Review Submission</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowApproveModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 font-semibold"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Approve Task</span>
              </button>
              <button
                onClick={() => setShowRevisionModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 font-semibold"
              >
                <XCircle className="h-5 w-5" />
                <span>Request Revision</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Task Already Approved */}
        {task.status === 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-bold text-green-900">Task Approved</h3>
                <p className="text-green-700">
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
