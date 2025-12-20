'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  projectName: string;
  projectType: string;
  clientName: string;
  companyName: string;
}

export default function ContractModal({
  isOpen,
  onClose,
  onAccept,
  projectName,
  projectType,
  clientName,
  companyName,
}: ContractModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!agreed) {
      alert('Please read and accept the terms and conditions');
      return;
    }

    setLoading(true);
    await onAccept();
    setLoading(false);
  };

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Project Service Agreement</h2>
                    <p className="text-blue-100 text-sm">Please review and accept the terms to proceed</p>
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
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-250px)]">
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

                <h3 className="text-xl font-bold text-gray-900 mb-4">Terms and Conditions</h3>

                <div className="space-y-6 text-gray-700">
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">1. SCOPE OF WORK</h4>
                    <p className="text-sm leading-relaxed">
                      Pixels Digital Solutions ("Service Provider") agrees to provide {projectType} services as outlined in the project "{projectName}" to {companyName} ("Client"). The specific deliverables, milestones, and timelines are detailed in the project dashboard and will be executed as agreed upon between both parties.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">2. PAYMENT TERMS</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Payment schedule will follow the milestone-based structure as defined in the project.</li>
                      <li>Invoices will be generated upon milestone completion and must be paid within 15 days.</li>
                      <li>Late payments may incur additional charges or project suspension.</li>
                      <li>All payments are non-refundable once work has commenced, except as outlined in the refund policy.</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">3. CLIENT RESPONSIBILITIES</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Provide timely feedback and approvals within 48-72 business hours.</li>
                      <li>Supply all necessary content, materials, and access credentials required for project completion.</li>
                      <li>Respond to queries and requests from the Service Provider in a timely manner.</li>
                      <li>Review and approve deliverables at each milestone stage.</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">4. SERVICE PROVIDER RESPONSIBILITIES</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Deliver work according to agreed timelines and quality standards.</li>
                      <li>Maintain regular communication through the project portal and chat system.</li>
                      <li>Provide revisions as per the agreed revision policy (typically 2-3 rounds per milestone).</li>
                      <li>Ensure confidentiality and security of all client data and materials.</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">5. REVISIONS & MODIFICATIONS</h4>
                    <p className="text-sm leading-relaxed">
                      Each milestone includes a specified number of revision rounds (typically 2-3). Additional revisions beyond the agreed scope may incur extra charges. Major scope changes will require a new project agreement and additional fees.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">6. INTELLECTUAL PROPERTY</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Upon full payment, all deliverables and intellectual property rights transfer to the Client.</li>
                      <li>Service Provider retains the right to showcase the work in portfolios unless a separate NDA is signed.</li>
                      <li>Any pre-existing materials or third-party assets remain the property of their respective owners.</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">7. CONFIDENTIALITY</h4>
                    <p className="text-sm leading-relaxed">
                      Both parties agree to maintain confidentiality of all proprietary information, trade secrets, and sensitive data shared during the project. This obligation continues even after project completion.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">8. PROJECT DELAYS</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Delays caused by client (late feedback, content, approvals) may extend the project timeline.</li>
                      <li>Service Provider will notify client of any anticipated delays on their end.</li>
                      <li>Extended delays may result in project re-scoping or additional charges.</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">9. TERMINATION</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Either party may terminate with 15 days written notice.</li>
                      <li>Client must pay for all completed work and work-in-progress up to termination date.</li>
                      <li>Termination does not affect payment obligations for work already performed.</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">10. WARRANTY & SUPPORT</h4>
                    <p className="text-sm leading-relaxed">
                      Service Provider warrants that all deliverables will be free from defects and will function as specified. Post-launch support period (if applicable) will be as defined in the project scope. Additional support beyond the agreed period may incur maintenance fees.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">11. LIMITATION OF LIABILITY</h4>
                    <p className="text-sm leading-relaxed">
                      Service Provider's liability is limited to the total amount paid for this project. Service Provider is not liable for indirect, consequential, or incidental damages arising from the use or inability to use the delivered services.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">12. DISPUTE RESOLUTION</h4>
                    <p className="text-sm leading-relaxed">
                      Any disputes will first be attempted to resolve through good-faith negotiation. If unresolved, disputes will be subject to binding arbitration in accordance with the laws of India, with jurisdiction in Indore, Madhya Pradesh.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">13. COMMUNICATION</h4>
                    <p className="text-sm leading-relaxed">
                      All project communication should be conducted through the official client portal chat system or registered email addresses. This ensures proper documentation and prevents miscommunication.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">14. FORCE MAJEURE</h4>
                    <p className="text-sm leading-relaxed">
                      Neither party shall be liable for delays or failures in performance resulting from acts beyond their reasonable control, including but not limited to acts of God, natural disasters, pandemics, war, terrorism, or government actions.
                    </p>
                  </section>
                </div>

                <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">ACCEPTANCE</h4>
                  <p className="text-sm text-gray-700 mb-4">
                    By checking the box below and clicking "Accept & Start Project," you acknowledge that you have read, understood, and agree to be bound by all the terms and conditions outlined in this agreement.
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <strong>Important:</strong> This is a legally binding agreement. Once accepted, you will have access to submit work, communicate via chat, make payments, and track project progress. Please ensure you understand all terms before proceeding.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
              <label className="flex items-center space-x-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the terms and conditions of this project service agreement
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
                      <span>Processing...</span>
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
