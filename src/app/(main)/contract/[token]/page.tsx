'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, ShieldCheck, ChevronRight, FileText, CheckSquare, Square } from 'lucide-react';

export default function ContractPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [justAccepted, setJustAccepted] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/contract/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProject(data.project);
        } else {
          setError(data.error || 'Failed to load project contract.');
        }
      })
      .catch((err) => setError('Failed to connect to server.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAcceptContract = async () => {
    if (!agreed) return;
    setProcessing(true);

    try {
      const res = await fetch(`/api/contract/${token}`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setJustAccepted(true);
      } else {
        throw new Error(data.error || 'Failed to accept contract');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred while accepting the contract.');
      setProcessing(false);
    }
  };

  const handleDownloadAgreement = () => {
    if (!project) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Agreement - ${project.projectName}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; }
          .header h1 { color: #1a1a1a; margin-bottom: 10px; }
          .details { margin-bottom: 30px; }
          .details div { margin-bottom: 5px; }
          .agreement { white-space: pre-wrap; font-family: monospace; background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Project Agreement</h1>
          <p>${project.projectName}</p>
        </div>
        <div class="details">
          <div><strong>Client:</strong> ${project.clientName || 'N/A'}</div>
          <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
        </div>
        <div class="agreement">${project.agreementText ? project.agreementText.replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'Standard terms and conditions apply.'}</div>
        <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
          <button onclick="window.print()" style="background: #1565C0; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Print / Save PDF</button>
        </div>
        <script>
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Proposal Expired or Invalid</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/client-portal/login')}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Client Portal
          </button>
        </div>
      </div>
    );
  }

  if (project?.contractAccepted || justAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-blue-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {justAccepted ? 'Contract Accepted!' : 'Contract Already Accepted'}
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            {justAccepted 
              ? 'Thank you for your confirmation. The project is now active and we are ready to begin work!'
              : 'This contract has already been accepted and the project is active. Please log in to your portal to view details.'}
          </p>
          <button 
            onClick={() => router.push('/client-portal/login')}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            Go to Client Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Project Proposal & Contract</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Review the project details and confirm your agreement to begin.
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 bg-gray-50">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{project.projectName}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Prepared for {project.clientName}</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500 block">Total Budget</span>
              <span className="text-2xl font-bold text-indigo-600">₹{project.budget?.toLocaleString('en-IN') || 0}</span>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-500" />
              Project Scope
            </h4>
            <div className="prose prose-indigo max-w-none text-gray-600 bg-gray-50 p-4 rounded-md mb-6">
              {project.description || 'No description provided.'}
            </div>

            {project.milestones && project.milestones.length > 0 && (
              <>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Milestones & Payments</h4>
                <div className="border border-gray-200 rounded-md divide-y divide-gray-200 mb-6">
                  {project.milestones.map((milestone: any, index: number) => (
                    <div key={index} className="p-4 flex justify-between items-center bg-white">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{milestone.name}</p>
                        <p className="text-xs text-gray-500">Due: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'TBD'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">₹{milestone.amount?.toLocaleString('en-IN') || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Terms and Payment Section */}
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Terms & Agreement</h3>
            
            <div className="bg-white p-6 border border-gray-200 rounded-md mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-semibold text-gray-900">Terms & Conditions</h4>
                <button 
                  onClick={handleDownloadAgreement}
                  className="text-xs flex items-center gap-1 bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
              <div className="bg-gray-50 p-4 border border-gray-200 rounded-md h-64 overflow-y-auto mb-4 text-sm text-gray-600 whitespace-pre-wrap">
                {project.agreementText || 'Standard terms and conditions apply. Please refer to the official proposal document.'}
              </div>
            </div>

            <div 
              className="flex items-start mb-6 cursor-pointer"
              onClick={() => setAgreed(!agreed)}
            >
              <div className="flex-shrink-0 mt-0.5">
                {agreed ? (
                  <CheckSquare className="h-5 w-5 text-indigo-600" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700 cursor-pointer">
                  I agree to the terms and conditions and authorize the project to begin
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-5 flex items-center justify-end">
              <button
                disabled={!agreed || processing}
                onClick={handleAcceptContract}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                  agreed && !processing ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm & Submit
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
