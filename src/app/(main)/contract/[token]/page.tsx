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
  Clock,
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
    <div className="min-h-screen bg-slate-100/90 text-slate-800 antialiased selection:bg-slate-200">
      
      {/* Sleek Top Document Control Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
              P
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Official Document</p>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-[180px] sm:max-w-xs">{project.projectName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAccepted ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Signed & Verified
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Pending Signature
              </span>
            )}

            <button
              onClick={handleDownloadAgreement}
              className="px-3 sm:px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs flex items-center gap-1.5 hover:shadow"
              title="Download official agreement as PDF"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Download PDF</span>
            </button>

            {isAccepted && (
              <button
                onClick={() => router.push('/client-portal/dashboard')}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs"
              >
                <span>Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Document Canvas */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        
        {/* Single Seamless Document Sheet */}
        <article className="bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden divide-y divide-slate-100">
          
          {/* Document Letterhead */}
          <div className="p-6 sm:p-10 bg-linear-to-b from-slate-50/70 to-white">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-slate-500">
                    Pixels Digital Solutions
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-400 font-mono">
                    REF: {token.slice(0, 12)}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {project.projectName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">
                  Binding Project Agreement & Statement of Work
                </p>
              </div>

              {/* Agreed Budget Badge */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl sm:text-right min-w-[180px] shadow-sm">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Total Agreed Investment</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
                  ₹{(project.budget || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block font-medium">Prepared For</span>
                <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                  {project.clientName || 'Valued Client'}
                </span>
                <span className="text-slate-500 block truncate">{project.clientEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Service Domain</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">{project.projectType || 'Digital Development'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Proposal Date</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Agreement Status</span>
                {isAccepted ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Electronically Signed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-600 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> Awaiting Acceptance
                  </span>
                )}
              </div>
            </div>

            {/* Signed Verification Seal (if accepted) */}
            {isAccepted && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3 text-emerald-950">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold text-emerald-900">
                    Official Signed Agreement on Record
                  </p>
                  <p className="text-emerald-800 text-xs mt-0.5 font-light leading-relaxed">
                    Electronically verified and signed by <strong>{project.clientEmail || 'Client'}</strong> on <strong>{acceptedDate}</strong> (IST). A verified PDF receipt has been sent to your registered email address.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Article 1: Executive Scope & Objectives */}
          <section className="p-6 sm:p-10">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">1</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Executive Scope of Work</h2>
            </div>
            <div className="bg-slate-50/80 p-5 sm:p-6 rounded-xl border border-slate-200/70 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-light">
              {project.description || 'Deliverables and project execution specifications as mutually agreed.'}
            </div>
          </section>

          {/* Article 2: Comprehensive Project Report & Roadmap */}
          {project.projectReport && (
            <section className="p-6 sm:p-10">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">2</span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Comprehensive Technical Specifications & Roadmap</h2>
              </div>
              <div className="bg-slate-50/80 p-5 sm:p-6 rounded-xl border border-slate-200/70 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-light">
                {project.projectReport}
              </div>
            </section>
          )}

          {/* Article 3: Phased Milestones & Payment Schedule */}
          <section className="p-6 sm:p-10">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                {project.projectReport ? '3' : '2'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Phased Roadmap & Payment Schedule</h2>
            </div>

            {project.milestones && project.milestones.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="bg-slate-50 px-5 py-3 grid grid-cols-12 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="col-span-7 sm:col-span-8">Milestone Phase</span>
                  <span className="col-span-5 sm:col-span-4 text-right">Investment</span>
                </div>
                {project.milestones.map((milestone: any, index: number) => (
                  <div key={index} className="px-5 py-3.5 grid grid-cols-12 items-center text-xs sm:text-sm bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-7 sm:col-span-8 pr-2">
                      <p className="font-semibold text-slate-900">{milestone.name}</p>
                      {milestone.description && (
                        <p className="text-xs text-slate-500 font-light mt-0.5">{milestone.description}</p>
                      )}
                      {milestone.dueDate && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Est. Due: {new Date(milestone.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <div className="col-span-5 sm:col-span-4 text-right">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        ₹{(milestone.amount || 0).toLocaleString('en-IN')}
                      </span>
                      {milestone.paymentStatus === 'paid' && (
                        <span className="block text-[11px] text-emerald-600 font-semibold">Paid</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs sm:text-sm italic">Standard payment upon project milestones.</p>
            )}
          </section>

          {/* Article 4: Legal Terms & Conditions */}
          <section className="p-6 sm:p-10">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                {project.projectReport ? '4' : '3'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Terms & Conditions</h2>
            </div>
            <div className="bg-slate-50/80 p-5 sm:p-6 rounded-xl border border-slate-200/70 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-72 sm:max-h-96 overflow-y-auto">
              {project.agreementText || 'Standard terms and conditions apply. Full intellectual property ownership transfers to the client upon settlement of final milestone invoice.'}
            </div>
          </section>

          {/* Article 5: Execution & Digital Signatures */}
          <section className="p-6 sm:p-10 bg-slate-50/50">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                {project.projectReport ? '5' : '4'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Authorization & Signatures</h2>
            </div>

            {!isAccepted ? (
              <div>
                <div 
                  className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl mb-6 cursor-pointer hover:border-slate-900 transition-colors shadow-xs active:scale-[0.99]"
                  onClick={() => setAgreed(!agreed)}
                >
                  <div className="mt-0.5 shrink-0">
                    {agreed ? (
                      <CheckSquare className="w-5 h-5 text-slate-900" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-light">
                    I, on behalf of <strong className="font-semibold text-slate-900">{project.clientName || project.clientEmail}</strong>, confirm that I have reviewed and approved the Scope of Work, Phased Milestones, and Terms & Conditions. By signing below, I authorize Pixels Digital Solutions to commence project delivery under this binding agreement.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    onClick={handleDownloadAgreement}
                    className="px-5 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Print / Save Copy</span>
                  </button>

                  <button
                    disabled={!agreed || processing}
                    onClick={handleAcceptContract}
                    className={`px-8 py-3.5 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 text-sm sm:text-base min-h-[48px] ${
                      agreed && !processing 
                        ? 'bg-slate-900 hover:bg-slate-800 cursor-pointer shadow-slate-900/10' 
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Signing & Confirming...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Authorize & Sign Agreement</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Service Provider Signature</p>
                  <p className="text-sm font-bold text-slate-900">Pixels Digital Solutions</p>
                  <p className="text-xs text-slate-500 font-light mt-0.5">Authorized Digital Representative</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Approved & Executed
                  </div>
                </div>

                <div className="p-4 bg-white border border-emerald-200 rounded-xl shadow-xs">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Client Authorization & Signature</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{project.clientName || 'Client'}</p>
                  <p className="text-xs text-slate-500 font-light mt-0.5 truncate">{project.clientEmail}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Signed on {acceptedDate} (IST)
                  </div>
                </div>
              </div>
            )}
          </section>

        </article>

      </main>

    </div>
  );
}
