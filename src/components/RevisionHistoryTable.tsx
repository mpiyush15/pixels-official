'use client';

import { useState } from 'react';
import { FileText, FileImage, FileVideo, File, Calendar, User, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubmissionFile {
  name: string;
  url: string;
  key?: string;
  size?: number;
  uploadedAt?: Date;
}

interface Submission {
  revisionNumber: number;
  submittedAt: Date | string;
  submittedBy: string;
  submittedByName: string;
  notes: string;
  files: SubmissionFile[];
  status: 'pending-review' | 'approved' | 'revision-requested';
  adminNotes?: string;
  adminAction?: {
    by: string;
    byName: string;
    at: Date | string;
  };
}

interface RevisionHistoryTableProps {
  submissions: Submission[];
  onFileClick: (file: SubmissionFile) => void;
  viewType: 'admin' | 'staff';
}

export default function RevisionHistoryTable({ submissions, onFileClick, viewType }: RevisionHistoryTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return <FileImage className="h-4 w-4" />;
    } else if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '')) {
      return <FileVideo className="h-4 w-4" />;
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'pending-review': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'approved': 'bg-green-100 text-green-700 border-green-300',
      'revision-requested': 'bg-red-100 text-red-700 border-red-300',
    };
    
    const labels = {
      'pending-review': 'Pending Review',
      'approved': 'Approved',
      'revision-requested': 'Revision Requested',
    };

    const icons = {
      'pending-review': <Clock className="h-3 w-3" />,
      'approved': <CheckCircle className="h-3 w-3" />,
      'revision-requested': <XCircle className="h-3 w-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles['pending-review']}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!submissions || submissions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No submissions yet</p>
        <p className="text-sm text-gray-500 mt-1">Submissions will appear here once staff submits their work</p>
      </div>
    );
  }

  // Sort by revision number descending (latest first)
  const sortedSubmissions = [...submissions].sort((a, b) => b.revisionNumber - a.revisionNumber);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Submission History ({submissions.length} {submissions.length === 1 ? 'Revision' : 'Revisions'})
        </h2>
        <p className="text-indigo-100 text-sm mt-1">Click on files to preview</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Revision
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Files
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedSubmissions.map((submission) => (
              <motion.tr
                key={submission.revisionNumber}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      #{submission.revisionNumber}
                    </div>
                    {submission.revisionNumber === sortedSubmissions[0].revisionNumber && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        Latest
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(submission.submittedAt)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <User className="h-3 w-3" />
                      {submission.submittedByName}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {submission.files && submission.files.length > 0 ? (
                      submission.files.map((file, idx) => (
                        <button
                          key={idx}
                          onClick={() => onFileClick(file)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors text-xs font-medium border border-indigo-200"
                          title={file.name}
                        >
                          {getFileIcon(file.name)}
                          <span className="max-w-[120px] truncate">{file.name}</span>
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No files attached</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  {getStatusBadge(submission.status)}
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => setExpandedRow(expandedRow === submission.revisionNumber ? null : submission.revisionNumber)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {expandedRow === submission.revisionNumber ? 'Hide' : 'Show'} Details
                  </button>
                </td>
              </motion.tr>
            ))}

            {/* Expanded Row Details */}
            {sortedSubmissions.map((submission) => 
              expandedRow === submission.revisionNumber && (
                <tr key={`expanded-${submission.revisionNumber}`} className="bg-gray-50">
                  <td colSpan={5} className="px-6 py-4">
                    <div className="space-y-3">
                      {/* Staff Notes */}
                      {submission.notes && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start gap-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-purple-600 mt-0.5" />
                            <h4 className="text-sm font-semibold text-gray-900">Staff Notes</h4>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap pl-6">{submission.notes}</p>
                        </div>
                      )}

                      {/* Admin Feedback */}
                      {viewType === 'staff' && submission.adminNotes && (
                        <div className={`rounded-lg p-4 border ${
                          submission.status === 'approved' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-orange-50 border-orange-200'
                        }`}>
                          <div className="flex items-start gap-2 mb-2">
                            {submission.status === 'approved' ? (
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                            )}
                            <h4 className="text-sm font-semibold text-gray-900">
                              {submission.status === 'approved' ? 'Approval Notes' : 'Revision Request'}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap pl-6">{submission.adminNotes}</p>
                          {submission.adminAction && (
                            <p className="text-xs text-gray-500 mt-2 pl-6">
                              By {submission.adminAction.byName} on {formatDate(submission.adminAction.at)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
