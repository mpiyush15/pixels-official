'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, Trash2, Plus, X, Download, FileText } from 'lucide-react';

interface WorkSubmission {
  _id: string;
  title: string;
  description: string;
  workType: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  notes?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'needs-revision';
  submittedAt: string;
}

interface SubmissionData {
  title: string;
  description: string;
  workType: string;
  fileUrl?: string;
  fileName?: string;
  fileKey?: string;
  fileSize?: number;
  notes?: string;
}

export default function SubmitWorkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [formData, setFormData] = useState<SubmissionData>({
    title: '',
    description: '',
    workType: 'design',
    fileUrl: '',
    fileName: '',
    fileKey: '',
    fileSize: 0,
    notes: '',
  });

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

      fetchSubmissions();
    } catch (error) {
      router.push('/client-portal/login');
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/client-portal/submit-work');
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const response = await fetch(`/api/client-portal/submit-work/${submissionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSubmissions();
      } else {
        alert('Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File too large! Maximum size is 10MB.`);
      return;
    }

    const validExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'zip', 'rar'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      alert(`Invalid file type! Videos are not supported.`);
      return;
    }

    setUploading(true);

    try {
      const urlResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      const urlData = await urlResponse.json();

      if (!urlData.uploadUrl) {
        throw new Error('Failed to get upload URL');
      }

      const uploadResponse = await fetch(urlData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      setFormData({
        ...formData,
        fileUrl: urlData.fileUrl,
        fileName: file.name,
        fileKey: urlData.key,
        fileSize: file.size,
      });

      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/client-portal/submit-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          title: '',
          description: '',
          workType: 'design',
          fileUrl: '',
          fileName: '',
          fileKey: '',
          fileSize: 0,
          notes: '',
        });
        setShowForm(false);
        fetchSubmissions();
        alert('Work submitted successfully!');
      } else {
        alert('Failed to submit work: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting work:', error);
      alert('Failed to submit work. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-gray-100 text-gray-700',
      reviewed: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      'needs-revision': 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-black mb-2">Submit Work</h1>
            <p className="text-gray-600 font-light">
              View your submissions or submit new work
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 font-light"
          >
            <Plus className="w-5 h-5" />
            Submit New Work
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-light mb-4">No work submitted yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-light"
            >
              Submit Your First Work
            </button>
          </div>
        ) : (
          submissions.map((submission) => (
            <motion.div
              key={submission._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-light text-black mb-2">{submission.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600 font-light">
                    <span className="capitalize">{submission.workType.replace('-', ' ')}</span>
                    <span>•</span>
                    <span>{new Date(submission.submittedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-light ${getStatusColor(submission.status)}`}>
                    {submission.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleDeleteSubmission(submission._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete submission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-700 font-light mb-4">{submission.description}</p>

              {submission.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600 font-light">
                    <strong>Notes:</strong> {submission.notes}
                  </p>
                </div>
              )}

              {(submission.fileName || submission.fileUrl) && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3">
                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light text-blue-900 truncate">
                      {submission.fileName || 'Attached File'}
                    </p>
                    {submission.fileSize && (
                      <p className="text-xs text-blue-700">
                        {(submission.fileSize / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                  {submission.fileUrl && (
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-light flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      View
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-white rounded-xl p-8 border border-gray-200 m-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-light text-black">Submit New Work</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-600 font-light mb-2">
                      Work Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                      placeholder="E.g., Website Homepage Design"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 font-light mb-2">
                      Work Type *
                    </label>
                    <select
                      value={formData.workType}
                      onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                      required
                    >
                      <option value="design">Design Work</option>
                      <option value="development">Development Work</option>
                      <option value="content">Content Creation</option>
                      <option value="revision">Revision/Update</option>
                      <option value="final">Final Deliverable</option>
                      <option value="progress">Progress Update</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 font-light mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light resize-none"
                      rows={4}
                      placeholder="Describe your work..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 font-light mb-2">
                      Upload File (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                      {formData.fileName ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-light">File uploaded!</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-black">{formData.fileName}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formData.fileSize ? `${(formData.fileSize / 1024).toFixed(1)} KB` : ''}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, fileUrl: '', fileName: '', fileKey: '', fileSize: 0 })}
                            className="text-sm text-red-600 hover:text-red-700 font-light"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 font-light mb-2">
                            Upload your work file
                          </p>
                          <p className="text-xs text-gray-500 font-light mb-4">
                            PDF, Word, Excel, Images, ZIP (Max 10MB)
                            <br />
                            <span className="text-red-500">Videos not supported</span>
                          </p>
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file);
                            }}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar"
                            className="hidden"
                            id="file-upload"
                            disabled={uploading}
                          />
                          <label
                            htmlFor="file-upload"
                            className={`inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer font-light ${
                              uploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {uploading ? 'Uploading...' : 'Choose File'}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 font-light mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light resize-none"
                      rows={3}
                      placeholder="Any additional information..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-light"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || uploading}
                      className="flex-1 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-light flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Submit Work
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
