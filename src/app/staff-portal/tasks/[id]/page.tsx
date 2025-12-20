'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, User, FileText, AlertCircle, Upload, 
  CheckCircle, Clock, Send, Download 
} from 'lucide-react';
import StaffTopBar from '@/components/StaffTopBar';

interface Task {
  _id: string;
  title: string;
  description: string;
  projectName?: string;
  clientName: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'submitted' | 'approved' | 'revision-needed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  startDate?: string;
  completedDate?: string;
  submittedDate?: string;
  files: Array<{
    name: string;
    url: string;
    key: string;
    size: number;
  }>;
  submissionNotes?: string;
  adminNotes?: string;
  revisionReason?: string;
  createdAt: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/staff-auth/session');
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/staff-portal/login');
        return;
      }

      setStaff(data.staff);
      await fetchTask();
    } catch (error) {
      router.push('/staff-portal/login');
    }
  };

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/staff/tasks`);
      if (response.ok) {
        const tasks = await response.json();
        const currentTask = tasks.find((t: Task) => t._id === params.id);
        if (currentTask) {
          setTask(currentTask);
          setNotes(currentTask.submissionNotes || '');
        } else {
          router.push('/staff-portal/dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!task) return;

    try {
      const response = await fetch(`/api/staff/tasks/${task._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchTask();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) return [];

    setUploading(true);
    const uploadedFileData = [];

    try {
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/s3/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedFileData.push({
            name: file.name,
            url: data.url,
            key: data.key,
            size: file.size,
          });
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }

    return uploadedFileData;
  };

  const handleSubmit = async () => {
    if (!task) return;

    if (!notes.trim() && uploadedFiles.length === 0) {
      alert('Please add notes or upload files before submitting');
      return;
    }

    setSubmitting(true);

    try {
      // Upload files first
      const files = await uploadFiles();

      // Submit task
      const response = await fetch(`/api/staff/tasks/${task._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          files,
        }),
      });

      if (response.ok) {
        alert('Task submitted successfully!');
        router.push('/staff-portal/dashboard');
      } else {
        alert('Failed to submit task');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Error submitting task');
    } finally {
      setSubmitting(false);
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
    return null;
  }

  const canStartTask = task.status === 'assigned';
  const canCompleteTask = task.status === 'in-progress';
  const canSubmitTask = ['in-progress', 'completed', 'revision-needed'].includes(task.status);
  const isSubmitted = ['submitted', 'approved'].includes(task.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {staff && <StaffTopBar staffName={staff.name} />}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
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
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()} PRIORITY
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-semibold text-gray-900">{task.clientName}</p>
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
                  {new Date(task.dueDate) < new Date() && ' (Overdue)'}
                </p>
              </div>
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

        {/* Revision Notes (if any) */}
        {task.status === 'revision-needed' && task.revisionReason && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">Revision Needed</h3>
                <p className="text-red-700">{task.revisionReason}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Admin Notes */}
        {task.adminNotes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
          >
            <h3 className="text-lg font-bold text-blue-900 mb-2">Admin Notes</h3>
            <p className="text-blue-700">{task.adminNotes}</p>
          </motion.div>
        )}

        {/* Status Actions */}
        {!isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Update Status</h2>
            <div className="flex flex-wrap gap-3">
              {canStartTask && (
                <button
                  onClick={() => updateStatus('in-progress')}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                >
                  <Clock className="h-5 w-5" />
                  <span>Start Working</span>
                </button>
              )}
              {canCompleteTask && (
                <button
                  onClick={() => updateStatus('completed')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Mark as Completed</span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Submission Form */}
        {canSubmitTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Work</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Notes *
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your work, any challenges faced, or additional information..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>{file.name}</span>
                        <span className="text-gray-400">({formatFileSize(file.size)})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || uploading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting || uploading ? (
                  <>
                    <Clock className="h-5 w-5 animate-spin" />
                    <span>{uploading ? 'Uploading files...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Submit Task</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Submitted Files */}
        {task.files && task.files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Submitted Files</h2>
            <div className="space-y-3">
              {task.files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Submission Notes (if submitted) */}
        {isSubmitted && task.submissionNotes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Submission Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{task.submissionNotes}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
