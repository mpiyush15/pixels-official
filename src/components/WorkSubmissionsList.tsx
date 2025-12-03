'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image as ImageIcon, File, Download, Clock, CheckCircle, XCircle, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';

interface WorkSubmission {
  clientId: string;
  clientName: string;
  clientEmail: string;
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  description: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface WorkSubmissionsListProps {
  projectId: string;
}

export default function WorkSubmissionsList({ projectId }: WorkSubmissionsListProps) {
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [projectId]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/work-submissions?projectId=${projectId}`);
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (index: number, newStatus: 'approved' | 'rejected') => {
    setUpdatingStatus(index);
    try {
      const response = await fetch('/api/work-submissions/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          submissionIndex: index,
          status: newStatus,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setSubmissions(prev => 
          prev.map((sub, idx) => 
            idx === index ? { ...sub, status: newStatus } : sub
          )
        );
      } else {
        alert('Failed to update status: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-500" />;
    } else {
      return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', text: 'Pending' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-700', text: 'Approved' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-700', text: 'Rejected' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-light flex items-center gap-1 ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <File className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="font-light">No work submissions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getFileIcon(submission.fileType)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-light text-gray-800 truncate">{submission.fileName}</h4>
                  <p className="text-xs text-gray-500 font-light">
                    {(submission.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {getStatusBadge(submission.status)}
              </div>

              <p className="text-sm text-gray-600 font-light mb-2">
                Submitted by: <span className="font-medium">{submission.clientName}</span>
              </p>

              {submission.description && (
                <p className="text-sm text-gray-700 font-light mb-2 bg-gray-50 p-2 rounded">
                  {submission.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-light">
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(submission.fileUrl, '_blank')}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-light hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(submission.fileUrl);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = submission.fileName;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (error) {
                        console.error('Download failed:', error);
                        // Fallback to direct link
                        window.open(submission.fileUrl, '_blank');
                      }
                    }}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded text-xs font-light hover:bg-gray-700 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              </div>

              {/* Approval/Rejection Buttons */}
              {submission.status === 'pending' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => updateStatus(index, 'approved')}
                    disabled={updatingStatus === index}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-xs font-light hover:bg-green-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {updatingStatus === index ? 'Updating...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => updateStatus(index, 'rejected')}
                    disabled={updatingStatus === index}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-xs font-light hover:bg-red-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    {updatingStatus === index ? 'Updating...' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
