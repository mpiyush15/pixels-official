'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, CheckCircle, AlertCircle, Lock } from 'lucide-react';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  projectId: string;
  projectName: string;
  projectType: string;
  clientName: string;
  clientId: string;
  contractContent: string;
  contractAccepted?: boolean;
  contractAcceptedAt?: string;
  canModifyUntil?: string;
}

export default function ContractModal({
  isOpen,
  onClose,
  onAccept,
  projectId,
  projectName,
  projectType,
  clientName,
  clientId,
  contractContent,
  contractAccepted = false,
  contractAcceptedAt,
  canModifyUntil,
}: ContractModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!agreed) {
      alert('Please read and accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/contract`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientName,
          accepted: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept contract');
      }

      alert('Contract accepted! Project is now active.');
      if (onAccept) onAccept();
      onClose();
    } catch (error) {
      console.error('Error accepting contract:', error);
      alert('Failed to accept contract: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isLocked = contractAccepted && contractAcceptedAt;
  const lockedDate = contractAcceptedAt ? new Date(contractAcceptedAt).toLocaleDateString('en-IN') : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className={`${isLocked ? 'bg-gray-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isLocked ? (
                    <Lock className="w-8 h-8" />
                  ) : (
                    <FileText className="w-8 h-8" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{isLocked ? 'Project Contract (Locked)' : 'Project Contract & Terms'}</h2>
                    <p className={isLocked ? 'text-gray-200 text-sm' : 'text-blue-100 text-sm'}>
                      {isLocked 
                        ? `Accepted on ${lockedDate} - Locked until ${canModifyUntil}` 
                        : 'Please review and accept the terms to proceed'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Contract Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="prose max-w-none">
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Project Name:</span>
                      <span className="ml-2 font-semibold text-gray-900">{projectName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Project Type:</span>
                      <span className="ml-2 font-semibold text-gray-900">{projectType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Client:</span>
                      <span className="ml-2 font-semibold text-gray-900">{clientName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-semibold text-gray-900">{today}</span>
                    </div>
                  </div>
                </div>

                {contractContent ? (
                  <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap text-sm text-gray-800 font-light leading-relaxed border border-gray-200">
                    {contractContent}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-gray-700 font-light">No contract content has been provided yet.</p>
                    <p className="text-sm text-gray-600 font-light mt-1">Please contact the admin for contract details.</p>
                  </div>
                )}

                {isLocked && (
                  <div className="mt-8 p-6 bg-gray-100 border border-gray-300 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <strong>Contract Locked:</strong> This contract was accepted on {lockedDate} and is locked until {canModifyUntil}. You can view this contract, but no modifications can be made during the locked period.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {!isLocked && contractContent && (
              <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                <label className="flex items-center space-x-3 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I have read and agree to all the terms and conditions of this project contract
                  </span>
                </label>

                <div className="flex space-x-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={!agreed || loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Accepting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Accept & Start Project</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {isLocked && (
              <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
