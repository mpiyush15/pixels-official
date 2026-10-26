'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Send,
  Rocket,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  Upload,
  Building,
  Mail,
  Calendar,
  AlertCircle,
  X,
  FileCheck,
  Download,
  Check
} from 'lucide-react';
import { RESEARCH_CATEGORIES } from '@/lib/constants/researchQuestions';

interface QuestionItem {
  id: string;
  category: string;
  categoryLabel?: string;
  question: string;
  answer: string;
  notes?: string;
  isCustom?: boolean;
}

interface CompetitorItem {
  name: string;
  website?: string;
  strengths: string;
  weaknesses: string;
}

interface MilestoneItem {
  name: string;
  description: string;
  amount?: number;
  targetWeeks: string;
}

interface ResearchData {
  _id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  clientEmail: string;
  clientPhone?: string;
  industry?: string;
  title: string;
  status: 'draft' | 'in_progress' | 'finalized' | 'sent_to_client' | 'converted';
  reportType: 'questions' | 'manual_upload' | 'both';
  uploadedReport?: {
    fileName: string;
    fileUrl: string;
    fileKey: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
  } | null;
  questions: QuestionItem[];
  marketAnalysis: {
    targetAudienceSummary: string;
    competitors: CompetitorItem[];
    marketOpportunities: string;
    risksAndChallenges: string;
  };
  recommendations: {
    suggestedScope: string;
    recommendedTechStack: string[];
    suggestedMilestones: MilestoneItem[];
    estimatedBudget: number;
    targetLaunchDate?: string;
  };
  executiveSummary?: string;
  emailDelivery?: {
    sentTo: string;
    sentAt: string;
    subject: string;
    messageId?: string;
    provider: string;
  };
  kickoffDetails?: {
    projectId: string;
    advancePaidAmount: number;
    paymentMethod: string;
    transactionReference?: string;
    invoiceId?: string;
    convertedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ResearchWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [research, setResearch] = useState<ResearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<'qa' | 'upload' | 'market' | 'recommendations'>('qa');
  
  // Selected category in Q&A
  const [selectedCategory, setSelectedCategory] = useState<string>('business_goals');

  // Custom question modal
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('business_goals');

  // Send Email Modal state (ZeptoMail)
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailCustomMessage, setEmailCustomMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState('');

  // Kickoff Project Modal state (Advance Payment)
  const [showKickoffModal, setShowKickoffModal] = useState(false);
  const [kickoffProjectName, setKickoffProjectName] = useState('');
  const [kickoffBudget, setKickoffBudget] = useState<number>(0);
  const [kickoffAdvance, setKickoffAdvance] = useState<number>(0);
  const [kickoffPaymentMethod, setKickoffPaymentMethod] = useState('Bank Transfer');
  const [kickoffTransactionRef, setKickoffTransactionRef] = useState('');
  const [kickoffGenerateInvoice, setKickoffGenerateInvoice] = useState(true);
  const [kickingOff, setKickingOff] = useState(false);

  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchResearch();
  }, [id]);

  const fetchResearch = async () => {
    try {
      const res = await fetch(`/api/client-research/${id}`);
      if (!res.ok) throw new Error('Research not found');
      const data: ResearchData = await res.json();
      setResearch(data);
      setEmailTo(data.clientEmail || '');
      setKickoffProjectName(`${data.companyName} - ${data.title}`);
      setKickoffBudget(data.recommendations?.estimatedBudget || 0);
      setKickoffAdvance(Math.round((data.recommendations?.estimatedBudget || 0) * 0.3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (silent = false) => {
    if (!research) return;
    if (!silent) setSaving(true);

    try {
      const answeredCount = research.questions.filter(q => q.answer && q.answer.trim().length > 0).length;
      let nextStatus = research.status;
      if (research.status === 'draft' && (answeredCount > 0 || research.uploadedReport)) {
        nextStatus = 'in_progress';
      }

      const res = await fetch(`/api/client-research/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: research.title,
          status: nextStatus,
          reportType: research.reportType,
          uploadedReport: research.uploadedReport,
          questions: research.questions,
          marketAnalysis: research.marketAnalysis,
          recommendations: research.recommendations,
          executiveSummary: research.executiveSummary,
        }),
      });

      if (res.ok) {
        setLastSaved(new Date());
        if (!silent) {
          setResearch(prev => prev ? { ...prev, status: nextStatus } : prev);
        }
      }
    } catch (err) {
      console.error('Error saving research workspace:', err);
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const updateAnswer = (questionId: string, text: string) => {
    if (!research) return;
    setResearch(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map(q => q.id === questionId ? { ...q, answer: text } : q),
      };
    });
  };

  const updateNotes = (questionId: string, notes: string) => {
    if (!research) return;
    setResearch(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map(q => q.id === questionId ? { ...q, notes } : q),
      };
    });
  };

  const handleAddCustomQuestion = () => {
    if (!newQuestionText.trim() || !research) return;

    const catObj = RESEARCH_CATEGORIES.find(c => c.id === newQuestionCategory);
    const newQ: QuestionItem = {
      id: `custom-${Date.now()}`,
      category: newQuestionCategory,
      categoryLabel: catObj?.label || 'Custom',
      question: newQuestionText.trim(),
      answer: '',
      notes: '',
      isCustom: true,
    };

    setResearch(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: [...prev.questions, newQ],
      };
    });

    setNewQuestionText('');
    setShowAddQuestionModal(false);
  };

  const handleRemoveQuestion = (questionId: string) => {
    if (!research) return;
    setResearch(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId),
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !research) return;

    setUploadingFile(true);
    setUploadError('');

    try {
      const presignedRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || 'application/pdf',
          fileSize: file.size,
        }),
      });

      if (!presignedRes.ok) {
        const errorData = await presignedRes.json();
        throw new Error(errorData.error || 'Failed to prepare upload');
      }

      const { uploadUrl, fileUrl, fileKey } = await presignedRes.json();

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/pdf' },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Direct upload to storage failed');
      }

      const uploadedReport = {
        fileName: file.name,
        fileUrl: fileUrl,
        fileKey: fileKey,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
      };

      const updatedReportType = research.reportType === 'questions' ? 'both' : research.reportType;

      const patchRes = await fetch(`/api/client-research/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadedReport,
          reportType: updatedReportType,
        }),
      });

      if (patchRes.ok) {
        setResearch(prev => prev ? { ...prev, uploadedReport, reportType: updatedReportType } : prev);
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Error uploading file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo.trim() || !research) return;
    setSendingEmail(true);
    setEmailSuccessMessage('');

    try {
      await handleSave(true);

      const res = await fetch(`/api/client-research/${id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo.trim(),
          customMessage: emailCustomMessage.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send report via ZeptoMail');

      setEmailSuccessMessage('Report dispatched successfully to client via ZeptoMail.');
      setResearch(prev => prev ? { ...prev, status: 'sent_to_client', emailDelivery: data.emailDelivery } : prev);
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccessMessage('');
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Error sending email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleKickoffProject = async () => {
    if (!research) return;
    setKickingOff(true);

    try {
      await handleSave(true);

      const res = await fetch(`/api/client-research/${id}/kickoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: kickoffProjectName.trim(),
          budget: Number(kickoffBudget),
          advanceAmount: Number(kickoffAdvance),
          paymentMethod: kickoffPaymentMethod,
          transactionReference: kickoffTransactionRef.trim(),
          generateInvoice: kickoffGenerateInvoice,
          milestones: research.recommendations.suggestedMilestones,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to kickoff project');

      alert('Project kicked off successfully. Advance payment recorded.');
      setShowKickoffModal(false);
      router.push(`/admin/projects`);
    } catch (err: any) {
      alert(err.message || 'Error kicking off project');
    } finally {
      setKickingOff(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-text-muted">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-3" />
        <p className="text-sm">Loading workspace...</p>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="p-8 text-center text-text-muted">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-text-muted" />
        <h2 className="text-base font-semibold text-text-primary">Research Record Not Found</h2>
        <button
          onClick={() => router.push('/admin/client-research')}
          className="mt-4 px-4 py-2 bg-surface border border-border text-text-primary text-sm rounded-lg hover:bg-background"
        >
          Back to Client Research
        </button>
      </div>
    );
  }

  const answeredQuestionsCount = research.questions.filter(q => q.answer && q.answer.trim().length > 0).length;
  const totalQuestionsCount = research.questions.length;
  const completionPercentage = Math.round((answeredQuestionsCount / (totalQuestionsCount || 1)) * 100);
  const filteredQuestions = research.questions.filter(q => q.category === selectedCategory);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-1 sm:px-0">
      {/* HEADER SECTION (CLEAN, MOBILE-RESPONSIVE & UNIFORM) */}
      <div className="pb-5 border-b border-border space-y-3">
        <button
          onClick={() => router.push('/admin/client-research')}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Client Research
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-semibold text-text-primary tracking-tight">
                {research.title}
              </h1>
              <span className="text-[11px] uppercase tracking-wider font-medium px-2 py-0.5 rounded border border-border bg-surface text-text-muted shrink-0">
                {research.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-text-muted mt-1.5 flex-wrap">
              <span className="font-medium text-text-primary">{research.companyName}</span>
              <span>•</span>
              <span>{research.clientName}</span>
              {research.clientEmail && (
                <>
                  <span>•</span>
                  <span>{research.clientEmail}</span>
                </>
              )}
              {lastSaved && (
                <>
                  <span>•</span>
                  <span className="text-text-muted">Saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS: CLEAN HORIZONTAL SCROLL ON MOBILE, INLINE ON DESKTOP */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0 w-full lg:w-auto scrollbar-hide">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="h-9 px-3.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-primary hover:bg-background transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Save className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            <button
              onClick={() => router.push(`/admin/client-research/${id}/report`)}
              className="h-9 px-3.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-primary hover:bg-background transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>Preview Report</span>
            </button>

            <button
              onClick={() => setShowEmailModal(true)}
              className="h-9 px-3.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-primary hover:bg-background transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>Send to Client</span>
            </button>

            <button
              onClick={() => setShowKickoffModal(true)}
              disabled={research.status === 'converted'}
              className="h-9 px-4 text-xs font-medium rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
            >
              <Rocket className="w-3.5 h-3.5 shrink-0" />
              <span>{research.status === 'converted' ? 'Project Active' : 'Kickoff Project'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUBTLE PROGRESS SUMMARY (MOBILE ADAPTIVE) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-text-muted py-1">
        <span>Discovery Progress: {answeredQuestionsCount} of {totalQuestionsCount} questions answered ({completionPercentage}%)</span>
        <div className="w-full sm:w-48 h-1.5 bg-surface rounded-full overflow-hidden border border-border">
          <div className="h-full bg-text-primary transition-all duration-300" style={{ width: `${completionPercentage}%` }} />
        </div>
      </div>

      {/* HORIZONTAL UNDERLINE TABS (LEGACY / STANDARD PIXELS OS TABS) */}
      <div className="flex gap-4 sm:gap-6 border-b border-border overflow-x-auto scrollbar-hide">
        {[
          { id: 'qa', label: `Discovery Questions (${totalQuestionsCount})` },
          { id: 'upload', label: `Report Document ${research.uploadedReport ? '(Attached)' : ''}` },
          { id: 'market', label: 'Competitor Analysis' },
          { id: 'recommendations', label: 'Scope & Recommendations' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap shrink-0 ${
              activeTab === tab.id ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="workspaceTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: QUESTIONNAIRE & FAQS */}
      {activeTab === 'qa' && (
        <div className="space-y-4">
          {/* MOBILE CATEGORY SELECTOR (HORIZONTAL SWIPEABLE BAR) */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-1 scrollbar-hide">
            {RESEARCH_CATEGORIES.map(cat => {
              const catQuestions = research.questions.filter(q => q.category === cat.id);
              const catAnswered = catQuestions.filter(q => q.answer && q.answer.trim().length > 0).length;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-surface font-semibold text-text-primary border border-border'
                      : 'bg-background text-text-muted border border-border/50'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="ml-1.5 opacity-70">({catAnswered}/{catQuestions.length})</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* DESKTOP CATEGORIES SIDEBAR */}
            <div className="hidden md:block md:col-span-1 space-y-1">
              <div className="text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-1 mb-1">
                Sections
              </div>
              {RESEARCH_CATEGORIES.map(cat => {
                const catQuestions = research.questions.filter(q => q.category === cat.id);
                const catAnswered = catQuestions.filter(q => q.answer && q.answer.trim().length > 0).length;
                const isActive = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                      isActive
                        ? 'bg-surface font-semibold text-text-primary border border-border'
                        : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
                    }`}
                  >
                    <span className="truncate pr-2">{cat.label}</span>
                    <span className="text-xs text-text-muted font-normal shrink-0">
                      {catAnswered}/{catQuestions.length}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setNewQuestionCategory(selectedCategory);
                  setShowAddQuestionModal(true);
                }}
                className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-text-muted hover:text-text-primary border border-dashed border-border rounded-lg hover:bg-surface transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Question</span>
              </button>
            </div>

            {/* QUESTIONS LIST */}
            <div className="md:col-span-3 space-y-4">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-sm font-semibold text-text-primary">
                  {RESEARCH_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Questions'}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Autosaves on blur</span>
                  {/* MOBILE ADD CUSTOM BUTTON */}
                  <button
                    onClick={() => {
                      setNewQuestionCategory(selectedCategory);
                      setShowAddQuestionModal(true);
                    }}
                    className="md:hidden text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Custom
                  </button>
                </div>
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="ta-card text-center p-8 text-text-muted text-sm">
                  No questions in this section yet.
                </div>
              ) : (
                filteredQuestions.map((q, idx) => (
                  <div key={q.id} className="ta-card space-y-3 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-medium text-text-primary leading-snug">
                        <span className="text-text-muted mr-1.5">{idx + 1}.</span>
                        {q.question}
                      </h3>

                      {q.isCustom && (
                        <button
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="text-text-muted hover:text-red-500 transition-colors p-1 shrink-0"
                          title="Delete question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-text-muted mb-1">
                        Response
                      </label>
                      <textarea
                        rows={3}
                        value={q.answer || ''}
                        onChange={e => updateAnswer(q.id, e.target.value)}
                        onBlur={() => handleSave(true)}
                        placeholder="Enter client response or discovery notes..."
                        className="w-full p-3 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-colors resize-y font-normal"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-text-muted mb-1">
                        Internal Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={q.notes || ''}
                        onChange={e => updateNotes(q.id, e.target.value)}
                        onBlur={() => handleSave(true)}
                        placeholder="Internal takeaways or follow-ups..."
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary transition-colors font-normal"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL REPORT UPLOAD */}
      {activeTab === 'upload' && (
        <div className="ta-card space-y-6 p-4 sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Attached Report Document</h2>
            <p className="text-xs text-text-muted mt-1">
              Upload an existing presentation, proposal deck, or PDF report for this client.
            </p>
          </div>

          {research.uploadedReport ? (
            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-text-muted shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-text-primary truncate">{research.uploadedReport.fileName}</h3>
                  <p className="text-xs text-text-muted">
                    {(research.uploadedReport.fileSize / (1024 * 1024)).toFixed(2)} MB • Uploaded on {new Date(research.uploadedReport.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={research.uploadedReport.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-primary hover:bg-background transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-text-muted" />
                  <span>Download</span>
                </a>

                <button
                  onClick={() => {
                    if (confirm('Remove this document?')) {
                      setResearch(prev => prev ? { ...prev, uploadedReport: null } : prev);
                      handleSave(false);
                    }
                  }}
                  className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-xl p-6 sm:p-8 text-center">
              <Upload className="w-6 h-6 text-text-muted mx-auto mb-2" />
              <p className="text-sm font-medium text-text-primary mb-1">
                Upload PDF, Presentation, or Document
              </p>
              <p className="text-xs text-text-muted mb-4">
                Supported formats: PDF, DOCX, PPTX
              </p>

              <label className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-xs font-medium text-text-primary hover:bg-background cursor-pointer transition-colors">
                {uploadingFile ? <span>Uploading...</span> : <span>Choose File</span>}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
              </label>

              {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPETITORS & MARKET INSIGHTS */}
      {activeTab === 'market' && (
        <div className="ta-card space-y-6 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-border gap-2">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Competitor Benchmarking</h2>
              <p className="text-xs text-text-muted">Analyze key market competitors to inform project positioning.</p>
            </div>

            <button
              onClick={() => {
                setResearch(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    marketAnalysis: {
                      ...prev.marketAnalysis,
                      competitors: [
                        ...prev.marketAnalysis.competitors,
                        { name: '', website: '', strengths: '', weaknesses: '' }
                      ]
                    }
                  };
                });
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-primary hover:bg-background flex items-center gap-1.5 w-fit"
            >
              <Plus className="w-3.5 h-3.5" /> Add Competitor
            </button>
          </div>

          <div className="space-y-4">
            {research.marketAnalysis.competitors.map((comp, idx) => (
              <div key={idx} className="p-4 bg-surface border border-border rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-muted">Competitor #{idx + 1}</span>
                  {research.marketAnalysis.competitors.length > 1 && (
                    <button
                      onClick={() => {
                        setResearch(prev => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            marketAnalysis: {
                              ...prev.marketAnalysis,
                              competitors: prev.marketAnalysis.competitors.filter((_, i) => i !== idx)
                            }
                          };
                        });
                      }}
                      className="text-text-muted hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Competitor Name"
                    value={comp.name}
                    onChange={e => {
                      const val = e.target.value;
                      setResearch(prev => {
                        if (!prev) return prev;
                        const copy = [...prev.marketAnalysis.competitors];
                        copy[idx].name = val;
                        return { ...prev, marketAnalysis: { ...prev.marketAnalysis, competitors: copy } };
                      });
                    }}
                    onBlur={() => handleSave(true)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-text-primary"
                  />
                  <input
                    type="text"
                    placeholder="Website URL"
                    value={comp.website || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setResearch(prev => {
                        if (!prev) return prev;
                        const copy = [...prev.marketAnalysis.competitors];
                        copy[idx].website = val;
                        return { ...prev, marketAnalysis: { ...prev.marketAnalysis, competitors: copy } };
                      });
                    }}
                    onBlur={() => handleSave(true)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-text-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <textarea
                    rows={2}
                    placeholder="Strengths..."
                    value={comp.strengths}
                    onChange={e => {
                      const val = e.target.value;
                      setResearch(prev => {
                        if (!prev) return prev;
                        const copy = [...prev.marketAnalysis.competitors];
                        copy[idx].strengths = val;
                        return { ...prev, marketAnalysis: { ...prev.marketAnalysis, competitors: copy } };
                      });
                    }}
                    onBlur={() => handleSave(true)}
                    className="p-2.5 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-text-primary resize-y"
                  />
                  <textarea
                    rows={2}
                    placeholder="Weaknesses / Gaps..."
                    value={comp.weaknesses}
                    onChange={e => {
                      const val = e.target.value;
                      setResearch(prev => {
                        if (!prev) return prev;
                        const copy = [...prev.marketAnalysis.competitors];
                        copy[idx].weaknesses = val;
                        return { ...prev, marketAnalysis: { ...prev.marketAnalysis, competitors: copy } };
                      });
                    }}
                    onBlur={() => handleSave(true)}
                    className="p-2.5 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-text-primary resize-y"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Target Audience Summary
              </label>
              <textarea
                rows={3}
                placeholder="Core customer personas, demographics, and buying behaviors..."
                value={research.marketAnalysis.targetAudienceSummary || ''}
                onChange={e => {
                  const val = e.target.value;
                  setResearch(prev => prev ? {
                    ...prev,
                    marketAnalysis: { ...prev.marketAnalysis, targetAudienceSummary: val }
                  } : prev);
                }}
                onBlur={() => handleSave(true)}
                className="w-full p-3 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-text-primary resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Market Opportunities
              </label>
              <textarea
                rows={3}
                placeholder="Unique differentiation, gaps in competing offerings..."
                value={research.marketAnalysis.marketOpportunities || ''}
                onChange={e => {
                  const val = e.target.value;
                  setResearch(prev => prev ? {
                    ...prev,
                    marketAnalysis: { ...prev.marketAnalysis, marketOpportunities: val }
                  } : prev);
                }}
                onBlur={() => handleSave(true)}
                className="w-full p-3 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-text-primary resize-y"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RECOMMENDATIONS & SCOPE */}
      {activeTab === 'recommendations' && (
        <div className="ta-card space-y-6 p-4 sm:p-6">
          <div className="border-b border-border pb-2">
            <h2 className="text-base font-semibold text-text-primary">Scope & Project Recommendations</h2>
            <p className="text-xs text-text-muted">Define milestones and estimated budget to bridge into the active project.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Scope Summary
              </label>
              <textarea
                rows={4}
                placeholder="High-level deliverables and architecture overview..."
                value={research.recommendations.suggestedScope || ''}
                onChange={e => {
                  const val = e.target.value;
                  setResearch(prev => prev ? {
                    ...prev,
                    recommendations: { ...prev.recommendations, suggestedScope: val }
                  } : prev);
                }}
                onBlur={() => handleSave(true)}
                className="w-full p-3 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-text-primary resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Estimated Project Budget (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 150000"
                value={research.recommendations.estimatedBudget || ''}
                onChange={e => {
                  const val = Number(e.target.value);
                  setResearch(prev => prev ? {
                    ...prev,
                    recommendations: { ...prev.recommendations, estimatedBudget: val }
                  } : prev);
                  setKickoffBudget(val);
                  setKickoffAdvance(Math.round(val * 0.3));
                }}
                onBlur={() => handleSave(true)}
                className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary focus:outline-none focus:border-text-primary"
              />
              <p className="text-xs text-text-muted mt-1.5">
                Pre-populates the Kickoff Project modal.
              </p>
            </div>
          </div>

          {/* MILESTONES TABLE */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Suggested Project Milestones</h3>
              <button
                onClick={() => {
                  setResearch(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      recommendations: {
                        ...prev.recommendations,
                        suggestedMilestones: [
                          ...prev.recommendations.suggestedMilestones,
                          { name: `Phase ${prev.recommendations.suggestedMilestones.length + 1}`, description: '', targetWeeks: 'Week 4-6', amount: 0 }
                        ]
                      }
                    };
                  });
                }}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-surface border border-border text-text-primary hover:bg-background flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Milestone
              </button>
            </div>

            <div className="space-y-2">
              {research.recommendations.suggestedMilestones.map((m, idx) => (
                <div key={idx} className="p-3 bg-surface border border-border rounded-lg flex flex-col sm:flex-row sm:items-center gap-2.5">
                  <div className="w-full sm:w-1/4">
                    <input
                      type="text"
                      placeholder="Milestone Name"
                      value={m.name}
                      onChange={e => {
                        const val = e.target.value;
                        setResearch(prev => {
                          if (!prev) return prev;
                          const copy = [...prev.recommendations.suggestedMilestones];
                          copy[idx].name = val;
                          return { ...prev, recommendations: { ...prev.recommendations, suggestedMilestones: copy } };
                        });
                      }}
                      onBlur={() => handleSave(true)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-xs font-medium text-text-primary focus:outline-none focus:border-text-primary"
                    />
                  </div>

                  <div className="w-full sm:flex-1">
                    <input
                      type="text"
                      placeholder="Milestone deliverables"
                      value={m.description}
                      onChange={e => {
                        const val = e.target.value;
                        setResearch(prev => {
                          if (!prev) return prev;
                          const copy = [...prev.recommendations.suggestedMilestones];
                          copy[idx].description = val;
                          return { ...prev, recommendations: { ...prev.recommendations, suggestedMilestones: copy } };
                        });
                      }}
                      onBlur={() => handleSave(true)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-xs text-text-primary focus:outline-none focus:border-text-primary"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Timeline"
                      value={m.targetWeeks}
                      onChange={e => {
                        const val = e.target.value;
                        setResearch(prev => {
                          if (!prev) return prev;
                          const copy = [...prev.recommendations.suggestedMilestones];
                          copy[idx].targetWeeks = val;
                          return { ...prev, recommendations: { ...prev.recommendations, suggestedMilestones: copy } };
                        });
                      }}
                      onBlur={() => handleSave(true)}
                      className="w-full sm:w-24 px-2 py-1.5 bg-background border border-border rounded text-xs text-text-primary text-center focus:outline-none focus:border-text-primary"
                    />

                    {research.recommendations.suggestedMilestones.length > 1 && (
                      <button
                        onClick={() => {
                          setResearch(prev => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              recommendations: {
                                ...prev.recommendations,
                                suggestedMilestones: prev.recommendations.suggestedMilestones.filter((_, i) => i !== idx)
                              }
                            };
                          });
                        }}
                        className="p-1 text-text-muted hover:text-red-500 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD CUSTOM QUESTION (MOBILE OPTIMIZED) */}
      <AnimatePresence>
        {showAddQuestionModal && (
          <div className="ta-modal-overlay p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl p-5 sm:p-6 max-w-md w-full shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-base font-semibold text-text-primary">Add Custom Question</h3>
                <button onClick={() => setShowAddQuestionModal(false)} className="text-text-muted hover:text-text-primary p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Category
                  </label>
                  <select
                    value={newQuestionCategory}
                    onChange={e => setNewQuestionCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-text-primary"
                  >
                    {RESEARCH_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Question
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter custom question prompt..."
                    value={newQuestionText}
                    onChange={e => setNewQuestionText(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-text-primary resize-y"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAddQuestionModal(false)}
                    className="px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomQuestion}
                    disabled={!newQuestionText.trim()}
                    className="px-4 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    Add Question
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: SEND REPORT TO CLIENT (MOBILE OPTIMIZED) */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="ta-modal-overlay p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl p-5 sm:p-6 max-w-lg w-full shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Send Report to Client</h3>
                  <p className="text-xs text-text-muted">Sends via ZeptoMail transactional mailer</p>
                </div>
                <button onClick={() => setShowEmailModal(false)} className="text-text-muted hover:text-text-primary p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {emailSuccessMessage ? (
                <div className="p-6 text-center space-y-2">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-sm font-medium text-text-primary">{emailSuccessMessage}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={e => setEmailTo(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Message / Highlights (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={emailCustomMessage}
                      onChange={e => setEmailCustomMessage(e.target.value)}
                      placeholder="Add personal note or review request..."
                      className="w-full p-2.5 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-text-primary resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(false)}
                      className="px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendEmail}
                      disabled={sendingEmail || !emailTo.trim()}
                      className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {sendingEmail ? <span>Sending...</span> : <span>Send Report</span>}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: KICKOFF PROJECT WITH ADVANCE PAYMENT (MOBILE OPTIMIZED) */}
      <AnimatePresence>
        {showKickoffModal && (
          <div className="ta-modal-overlay p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl p-5 sm:p-6 max-w-lg w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Kickoff Project</h3>
                  <p className="text-xs text-text-muted">Convert discovery research to active project and log advance payment</p>
                </div>
                <button onClick={() => setShowKickoffModal(false)} className="text-text-muted hover:text-text-primary p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={kickoffProjectName}
                    onChange={e => setKickoffProjectName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-text-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Agreed Budget (₹)
                    </label>
                    <input
                      type="number"
                      value={kickoffBudget}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setKickoffBudget(val);
                        setKickoffAdvance(Math.round(val * 0.3));
                      }}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Advance Paid (₹)
                    </label>
                    <input
                      type="number"
                      value={kickoffAdvance}
                      onChange={e => setKickoffAdvance(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm font-semibold text-text-primary focus:outline-none focus:border-text-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Payment Method
                    </label>
                    <select
                      value={kickoffPaymentMethod}
                      onChange={e => setKickoffPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-text-primary"
                    >
                      <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                      <option value="UPI">UPI</option>
                      <option value="Cashfree">Cashfree</option>
                      <option value="Stripe">Stripe</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Transaction Ref / UTR
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UTR9283401928"
                      value={kickoffTransactionRef}
                      onChange={e => setKickoffTransactionRef(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-text-primary"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface border border-border flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="genInvoice"
                    checked={kickoffGenerateInvoice}
                    onChange={e => setKickoffGenerateInvoice(e.target.checked)}
                    className="w-4 h-4 rounded text-primary shrink-0"
                  />
                  <label htmlFor="genInvoice" className="text-xs text-text-primary cursor-pointer">
                    Auto-generate Advance Invoice and record payment in ledger
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowKickoffModal(false)}
                    className="px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleKickoffProject}
                    disabled={kickingOff || !kickoffProjectName.trim()}
                    className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {kickingOff ? <span>Processing...</span> : <span>Confirm & Kickoff</span>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
