'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, User, FileText, AlertCircle, Upload, 
  CheckCircle, Clock, Send, Download 
} from 'lucide-react';
import StaffTopBar from '@/components/StaffTopBar';
import FileThumbnail from '@/components/FileThumbnail';
import FilePreviewModal from '@/components/FilePreviewModal';
import RevisionHistoryTable from '@/components/RevisionHistoryTable';

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
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    url: string;
    key: string;
    size: number;
  } | null>(null);

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
      console.log('🔍 Fetching task from single task API:', params.id);
      
      const response = await fetch(`/api/staff/tasks/${params.id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('❌ Failed to fetch task:', response.status);
        if (response.status === 404) {
          router.push('/staff-portal/dashboard');
          return;
        }
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
      setNotes(data.task.submissionNotes || '');
    } catch (error) {
      console.error('❌ Error fetching task:', error);
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
          console.log('File uploaded:', data);
          uploadedFileData.push({
            name: file.name,
            url: data.url,
            key: data.key,
            size: file.size,
          });
        } else {
          console.error('Failed to upload file:', file.name);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }

    console.log('All uploaded files:', uploadedFileData);
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
      console.log('Files to submit:', files);

      // Submit task
      const response = await fetch(`/api/staff/tasks/${task._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          files,
        }),
      });

      console.log('Submit response status:', response.status);
      
      if (response.ok) {
        alert('Task submitted successfully!');
        // Refresh task data to show submitted files
        await fetchTask();
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push('/staff-portal/dashboard');
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error('Submit error:', errorData);
        alert('Failed to submit task: ' + (errorData.error || 'Unknown error'));
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
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
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white mb-2">{task.title}</h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)} bg-white`}>
                {task.status.replace('-', ' ').toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                {task.priority.toUpperCase()} PRIORITY
              </span>
            </div>
          </div>

          {/* Task Details Table */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Task Details
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-500 w-1/3">Client</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{task.clientName}</td>
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
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-500">Created</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(task.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-500 align-top">Description</td>
                    <td className="py-3 px-4 text-sm text-gray-900 whitespace-pre-wrap">{task.description}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Current Revision Status - Show if revision needed */}
        {task.status === 'revision-needed' && task.revisionReason && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 mb-1">Revision Required</h3>
                <p className="text-sm text-red-800 whitespace-pre-wrap">{task.revisionReason}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submission History Table */}
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
              viewType="staff"
            />
          </motion.div>
        )}

        {/* Action Buttons */}
        {!isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
          >
            <div className="flex flex-wrap items-center gap-3">
              {canStartTask && (
                <>
                  <button
                    onClick={() => updateStatus('in-progress')}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 font-medium"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Start Working</span>
                  </button>
                  <p className="text-sm text-gray-600">Click to begin this task and enable file upload</p>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Submission Form */}
        {canSubmitTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              Submit Your Work
            </h2>
            
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
                  placeholder="Describe your work, challenges faced, or any additional information..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <span className="flex-1">{file.name}</span>
                        <span className="text-gray-400">({formatFileSize(file.size)})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || uploading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              Submitted Files ({task.files.length})
            </h2>
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

        {/* No Files Message */}
        {(!task.files || task.files.length === 0) && isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 border border-gray-200 rounded-xl p-8 mb-6 text-center"
          >
            <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No files uploaded with this submission</p>
          </motion.div>
        )}

        {/* Submission Notes */}
        {isSubmitted && task.submissionNotes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Your Submission Notes
            </h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.submissionNotes}</p>
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
    </div>
  );
}
