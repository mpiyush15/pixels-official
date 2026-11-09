'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  ShieldCheck, 
  ChevronRight, 
  FileText, 
  CheckSquare, 
  Square, 
  Printer, 
  Download, 
  Calendar, 
  IndianRupee, 
  Lock,
  ExternalLink
} from 'lucide-react';

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
      .catch(() => setError('Failed to connect to server.'))
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

    const milestonesHtml = (project.milestones || []).map((m: any, i: number) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${i + 1}. ${m.name || 'Milestone'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${m.dueDate ? new Date(m.dueDate).toLocaleDateString('en-IN') : 'TBD'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">₹${(m.amount || 0).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Signed Agreement - ${project.projectName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; max-width: 850px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #111827; padding-bottom: 25px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 26px; color: #111827; }
          .header p { margin: 5px 0 0 0; color: #6b7280; font-size: 14px; }
          .meta-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; margin-bottom: 30px; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .section { margin-bottom: 35px; }
          .section h2 { font-size: 17px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .text-content { font-size: 14px; color: #374151; white-space: pre-wrap; line-height: 1.7; background: #fafafa; padding: 16px; border: 1px solid #f3f4f6; border-radius: 6px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 10px; }
          th { background: #f3f4f6; padding: 10px; text-align: left; }
          .signature-box { border: 2px dashed #10b981; background: #f0fdf4; padding: 20px; border-radius: 8px; margin-top: 40px; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Pixels Digital Solutions</h1>
          <p>Official Project Contract & Agreement</p>
        </div>

        <div class="meta-box">
          <div class="meta-row"><strong>Project Name:</strong> <span>${project.projectName}</span></div>
          <div class="meta-row"><strong>Prepared For (Client):</strong> <span>${project.clientName || project.clientEmail}</span></div>
          <div class="meta-row"><strong>Total Agreed Budget:</strong> <span>₹${(project.budget || 0).toLocaleString('en-IN')}</span></div>
          <div class="meta-row"><strong>Document Date:</strong> <span>${new Date().toLocaleDateString('en-IN')}</span></div>
        </div>

        <div class="section">
          <h2>1. Executive Summary & Project Scope</h2>
          <div class="text-content">${project.description || 'Deliverables and scope as mutually defined in project meetings.'}</div>
        </div>

        ${project.projectReport ? `
        <div class="section">
          <h2>2. Comprehensive Project Report & Roadmap</h2>
          <div class="text-content">${project.projectReport}</div>
        </div>
        ` : ''}

        <div class="section">
          <h2>3. Milestones & Payment Schedule</h2>
          <table>
            <thead>
              <tr>
                <th>Milestone Deliverable</th>
                <th style="text-align: center;">Due Date</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${milestonesHtml || '<tr><td colspan="3" style="padding: 10px; text-align: center;">Standard project delivery</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>4. Legal Terms & Conditions</h2>
          <div class="text-content">${project.agreementText || 'Standard terms and conditions apply. Intellectual property transfers upon complete settlement.'}</div>
        </div>

        <div class="signature-box">
          <strong>✅ Client Acceptance & Electronic Signature:</strong>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #065f46;">
            Accepted by: <strong>${project.clientEmail || 'Client'}</strong><br />
            Status: Confirmed & Electronically Signed on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)
          </p>
        </div>

        <div class="no-print" style="position: fixed; bottom: 25px; right: 25px;">
          <button onclick="window.print()" style="background: #111827; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            Print / Save PDF
          </button>
        </div>
        <script>
          setTimeout(() => { window.print(); }, 400);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading project agreement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Proposal Expired or Invalid</h2>
          <p className="text-gray-600 mb-6 font-light">{error}</p>
          <button 
            onClick={() => router.push('/client-portal/login')}
            className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-gray-900 transition-colors"
          >
            Go to Client Portal
          </button>
        </div>
      </div>
    );
  }

  const isAccepted = project?.contractAccepted || justAccepted;
  const acceptedDate = project?.contractAcceptedAt 
    ? new Date(project.contractAcceptedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) 
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  return (
    <div className="min-h-screen bg-gray-100/60 py-8 md:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-black text-white text-xs rounded-full font-light tracking-wide uppercase">
                  Official Contract & Proposal
                </span>
                {isAccepted ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Signed & Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Pending Client Signature
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                {project.projectName}
              </h1>
              <p className="text-gray-500 text-sm mt-1 font-light">
                Prepared by Pixels Digital Solutions for <strong className="text-gray-800">{project.clientName || project.clientEmail}</strong>
              </p>
            </div>

            <div className="flex flex-col md:items-end justify-center bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[200px]">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-light">Total Agreed Budget</span>
              <span className="text-2xl md:text-3xl font-bold text-gray-900 mt-0.5">
                ₹{(project.budget || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <div className="text-xs text-gray-500 font-light flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Created on {new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadAgreement}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs md:text-sm font-medium"
                title="Download complete agreement as PDF"
              >
                <Download className="w-4 h-4 text-gray-600" />
                <span>Download / Print PDF</span>
              </button>

              {isAccepted && (
                <button
                  onClick={() => router.push('/client-portal/dashboard')}
                  className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors flex items-center gap-2 text-xs md:text-sm font-medium"
                >
                  <span>Open Client Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Accepted Confirmation Banner */}
        {isAccepted && (
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 md:p-8 mb-8 text-green-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-green-900">
                  {justAccepted ? 'Contract Successfully Signed!' : 'Contract Already Accepted'}
                </h3>
                <p className="text-green-800 text-sm mt-1 font-light leading-relaxed">
                  Confirmed and signed on <strong>{acceptedDate}</strong> (IST). A signed PDF copy has been emailed to you, and your project is officially in progress.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadAgreement}
              className="px-5 py-2.5 bg-green-700 text-white rounded-xl font-medium hover:bg-green-800 transition-colors text-sm whitespace-nowrap flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Signed Copy</span>
            </button>
          </div>
        )}

        {/* Unified Complete Agreement Document */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200 mb-8">
          
          {/* Section 1: Executive Scope */}
          <div className="p-6 md:p-10">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Executive Scope & Objectives</h2>
            </div>
            <div className="prose max-w-none text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap bg-gray-50/70 p-6 rounded-xl border border-gray-100">
              {project.description || 'Deliverables and project execution specifications as mutually discussed.'}
            </div>
          </div>

          {/* Section 2: Comprehensive Project Report */}
          {project.projectReport && (
            <div className="p-6 md:p-10">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Comprehensive Project Report & Roadmap</h2>
              </div>
              <div className="prose max-w-none text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap bg-gray-50/70 p-6 rounded-xl border border-gray-100">
                {project.projectReport}
              </div>
            </div>
          )}

          {/* Section 3: Milestones & Payments */}
          <div className="p-6 md:p-10">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">
                {project.projectReport ? '3' : '2'}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Milestones & Payment Schedule</h2>
            </div>

            {project.milestones && project.milestones.length > 0 ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                <div className="bg-gray-50 px-5 py-3 grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <span className="col-span-6 md:col-span-7">Milestone Deliverable</span>
                  <span className="col-span-3 text-center">Due Date</span>
                  <span className="col-span-3 md:col-span-2 text-right">Amount</span>
                </div>
                {project.milestones.map((milestone: any, index: number) => (
                  <div key={index} className="px-5 py-4 grid grid-cols-12 items-center text-sm bg-white hover:bg-gray-50/50 transition-colors">
                    <div className="col-span-6 md:col-span-7 pr-2">
                      <p className="font-medium text-gray-900">{milestone.name}</p>
                      {milestone.description && (
                        <p className="text-xs text-gray-500 font-light mt-0.5">{milestone.description}</p>
                      )}
                    </div>
                    <div className="col-span-3 text-center text-gray-600 font-light text-xs md:text-sm">
                      {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString('en-IN') : 'TBD'}
                    </div>
                    <div className="col-span-3 md:col-span-2 text-right font-bold text-gray-900">
                      ₹{(milestone.amount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">Standard payment upon project delivery.</p>
            )}
          </div>

          {/* Section 4: Legal Terms & Conditions */}
          <div className="p-6 md:p-10">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-sm font-bold">
                {project.projectReport ? '4' : '3'}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Terms & Conditions</h2>
            </div>
            <div className="prose max-w-none text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap bg-gray-50/70 p-6 rounded-xl border border-gray-100 max-h-96 overflow-y-auto">
              {project.agreementText || 'Standard terms and conditions apply. Full IP ownership transfers to client upon settlement.'}
            </div>
          </div>

          {/* Section 5: Signature / Acceptance Block */}
          <div className="p-6 md:p-10 bg-gray-50/50">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-green-50 text-green-700 flex items-center justify-center text-sm font-bold">
                {project.projectReport ? '5' : '4'}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Electronic Signature & Authorization</h2>
            </div>

            {!isAccepted ? (
              <div>
                <div 
                  className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl mb-6 cursor-pointer hover:border-black transition-colors"
                  onClick={() => setAgreed(!agreed)}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {agreed ? (
                      <CheckSquare className="w-5 h-5 text-black" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed font-light">
                    I, representing <strong className="font-semibold text-black">{project.clientName || project.clientEmail}</strong>, confirm that I have reviewed the full Project Report, Scope of Work, Milestone Schedule, and Terms & Conditions. By clicking below, I authorize Pixels Digital Solutions to commence project execution under this binding agreement.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <button
                    onClick={handleDownloadAgreement}
                    className="w-full sm:w-auto px-5 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4 text-gray-500" />
                    <span>Print / Save Copy</span>
                  </button>

                  <button
                    disabled={!agreed || processing}
                    onClick={handleAcceptContract}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
                      agreed && !processing 
                        ? 'bg-black hover:bg-gray-800 cursor-pointer shadow-black/10' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Signing & Confirming...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Accept & Sign Contract</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-900 text-sm flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-semibold">Electronically Signed and Authorized</p>
                  <p className="text-xs text-green-800 font-light mt-0.5">
                    Signer: {project.clientEmail || 'Client'} • {acceptedDate} (IST)
                  </p>
                </div>
                <button
                  onClick={handleDownloadAgreement}
                  className="px-4 py-2 bg-green-700 text-white rounded-lg text-xs font-medium hover:bg-green-800 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed Agreement</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
