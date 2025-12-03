'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  FolderPlus,
  Calendar,
  User,
  FileText,
} from 'lucide-react';

interface WorkSubmission {
  _id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
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
  createdAt: string;
}

export default function AdminSubmittedWorkPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'approved' | 'needs-revision'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<WorkSubmission | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [projectFees, setProjectFees] = useState({
    totalAmount: 0,
    depositAmount: 0,
  });
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/submitted-work');
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/submitted-work/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchSubmissions();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const convertToProject = (submission: WorkSubmission) => {
    setSelectedSubmission(submission);
    setProjectFees({
      totalAmount: 0,
      depositAmount: 0,
    });
    setShowConvertModal(true);
  };

  const handleConvertToProject = async () => {
    if (!selectedSubmission) return;

    if (projectFees.totalAmount <= 0) {
      alert('Please enter total project amount');
      return;
    }

    if (projectFees.depositAmount < 0 || projectFees.depositAmount > projectFees.totalAmount) {
      alert('Invalid deposit amount');
      return;
    }

    setConverting(true);

    try {
      const response = await fetch('/api/admin/submitted-work/convert-to-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission._id,
          totalAmount: projectFees.totalAmount,
          depositAmount: projectFees.depositAmount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Project created successfully!');
        setShowConvertModal(false);
        setSelectedSubmission(null);
        fetchSubmissions(); // Refresh list
      } else {
        alert('Failed to create project: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error converting to project:', error);
      alert('Failed to create project');
    } finally {
      setConverting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-gray-100 text-gray-700',
      reviewed: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      'needs-revision': 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle className="w-4 h-4" />;
    if (status === 'needs-revision') return <XCircle className="w-4 h-4" />;
    if (status === 'reviewed') return <Eye className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-black mb-2">Submitted Work</h1>
        <p className="text-gray-600 font-light">
          Review client work submissions and convert them to projects
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Upload className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">{submissions.length}</p>
          <p className="text-sm text-gray-600 font-light">Total Submissions</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">
            {submissions.filter(s => s.status === 'pending').length}
          </p>
          <p className="text-sm text-gray-600 font-light">Pending Review</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">
            {submissions.filter(s => s.status === 'approved').length}
          </p>
          <p className="text-sm text-gray-600 font-light">Approved</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">
            {submissions.filter(s => s.status === 'reviewed').length}
          </p>
          <p className="text-sm text-gray-600 font-light">Reviewed</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-xl font-light transition-colors ${
            filter === 'all'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({submissions.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-6 py-2 rounded-xl font-light transition-colors ${
            filter === 'pending'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pending ({submissions.filter(s => s.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('reviewed')}
          className={`px-6 py-2 rounded-xl font-light transition-colors ${
            filter === 'reviewed'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Reviewed ({submissions.filter(s => s.status === 'reviewed').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-6 py-2 rounded-xl font-light transition-colors ${
            filter === 'approved'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Approved ({submissions.filter(s => s.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('needs-revision')}
          className={`px-6 py-2 rounded-xl font-light transition-colors ${
            filter === 'needs-revision'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Needs Revision ({submissions.filter(s => s.status === 'needs-revision').length})
        </button>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-light">No submissions found</p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <motion.div
              key={submission._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-light text-black mb-2">
                        {submission.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 font-light">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {submission.clientName}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {submission.workType.charAt(0).toUpperCase() + submission.workType.slice(1).replace('-', ' ')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(submission.submittedAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-light flex items-center gap-1 ${getStatusColor(
                        submission.status
                      )}`}
                    >
                      {getStatusIcon(submission.status)}
                      {submission.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 font-light mb-4">
                    {submission.description}
                  </p>

                  {submission.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-600 font-light">
                        <strong>Notes:</strong> {submission.notes}
                      </p>
                    </div>
                  )}

                  {/* File Info */}
                  {(submission.fileName || submission.fileUrl) && (
                    <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3 mb-4">
                      <Download className="w-4 h-4 text-blue-600 flex-shrink-0" />
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
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-light"
                        >
                          View
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:w-48">
                  <button
                    onClick={() => convertToProject(submission)}
                    className="flex-1 lg:flex-none px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm font-light"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Convert to Project
                  </button>

                  <select
                    value={submission.status}
                    onChange={(e) => updateStatus(submission._id, e.target.value)}
                    className="flex-1 lg:flex-none px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="approved">Approved</option>
                    <option value="needs-revision">Needs Revision</option>
                  </select>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Convert to Project Modal */}
      <AnimatePresence>
        {showConvertModal && selectedSubmission && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !converting && setShowConvertModal(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-xl p-6"
            >
              <h3 className="text-xl font-light text-black mb-4">Convert to Project</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-black mb-2">{selectedSubmission.title}</p>
                <p className="text-xs text-gray-600 font-light mb-1">
                  Client: {selectedSubmission.clientName}
                </p>
                <p className="text-xs text-gray-600 font-light">
                  Type: {selectedSubmission.workType}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Total Project Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={projectFees.totalAmount || ''}
                    onChange={(e) => setProjectFees({ ...projectFees, totalAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light"
                    placeholder="Enter total project fees"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Deposit/Advance Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={projectFees.depositAmount || ''}
                    onChange={(e) => setProjectFees({ ...projectFees, depositAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light"
                    placeholder="Initial deposit to unlock project"
                    min="0"
                    max={projectFees.totalAmount}
                  />
                  <p className="text-xs text-gray-500 font-light mt-1">
                    Client needs to pay this amount to unlock the project
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900 font-light">
                    <strong>Note:</strong> After conversion, the client will see this project with a "Pay Now" button. Once they pay the deposit amount, the project will be unlocked and they can view details and communicate.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConvertModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-light"
                  disabled={converting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvertToProject}
                  disabled={converting}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {converting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
