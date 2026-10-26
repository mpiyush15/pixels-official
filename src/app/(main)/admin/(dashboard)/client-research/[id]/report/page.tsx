'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  Download,
  Building,
  Calendar,
  FileCheck
} from 'lucide-react';
import { RESEARCH_CATEGORIES } from '@/lib/constants/researchQuestions';

interface ResearchData {
  _id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  clientEmail: string;
  industry?: string;
  title: string;
  status: string;
  reportType: 'questions' | 'manual_upload' | 'both';
  uploadedReport?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
  } | null;
  questions: Array<{
    id: string;
    category: string;
    categoryLabel?: string;
    question: string;
    answer: string;
    notes?: string;
    isCustom?: boolean;
  }>;
  marketAnalysis: {
    targetAudienceSummary: string;
    competitors: Array<{
      name: string;
      website?: string;
      strengths: string;
      weaknesses: string;
    }>;
    marketOpportunities: string;
    risksAndChallenges: string;
  };
  recommendations: {
    suggestedScope: string;
    recommendedTechStack: string[];
    suggestedMilestones: Array<{
      name: string;
      description: string;
      targetWeeks: string;
      amount?: number;
    }>;
    estimatedBudget: number;
  };
  executiveSummary?: string;
  createdAt: string;
}

export default function ProjectResearchReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [research, setResearch] = useState<ResearchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/client-research/${id}`)
      .then(res => res.json())
      .then(data => {
        setResearch(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-text-muted">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-3" />
        <p className="text-sm">Loading report...</p>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="p-8 text-center text-text-muted">
        <h2 className="text-base font-semibold text-text-primary">Report Not Found</h2>
        <button
          onClick={() => router.push('/admin/client-research')}
          className="mt-4 px-4 py-2 bg-surface border border-border text-text-primary text-sm rounded-lg"
        >
          Back to Hub
        </button>
      </div>
    );
  }

  const answeredQuestions = research.questions.filter(q => q.answer && q.answer.trim().length > 0);

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* SCREEN ACTIONS (HIDDEN ON PRINT) */}
      <div className="flex items-center justify-between gap-4 py-3 print:hidden">
        <button
          onClick={() => router.push(`/admin/client-research/${id}`)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Research Workspace
        </button>

        <div className="flex items-center gap-2">
          {research.uploadedReport && (
            <a
              href={research.uploadedReport.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-primary hover:bg-background transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-text-muted" /> Attached Document
            </a>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:opacity-90 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT CONTAINER (CLEAN & FORMAL) */}
      <div className="ta-card p-8 md:p-12 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* REPORT HEADER */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-text-muted font-medium mb-1">
              Project Discovery & Market Intelligence Report
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight">
              {research.title}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Prepared for <span className="font-medium text-text-primary">{research.companyName}</span>
            </p>
          </div>

          <div className="text-right flex flex-col md:items-end">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-1.5">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div className="text-xs font-semibold text-text-primary">Pixels Digital Solutions</div>
            <div className="text-[11px] text-text-muted">pixelsdigitalsolutions.com</div>
          </div>
        </div>

        {/* CLIENT META BANNER */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-surface border border-border">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-text-muted">Client Contact</div>
            <div className="text-sm font-medium text-text-primary mt-0.5">{research.clientName}</div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-text-muted">Company</div>
            <div className="text-sm font-medium text-text-primary mt-0.5">{research.companyName}</div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-text-muted">Industry</div>
            <div className="text-sm font-medium text-text-primary mt-0.5">{research.industry || 'Digital Technology'}</div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-text-muted">Date</div>
            <div className="text-sm font-medium text-text-primary mt-0.5">
              {new Date(research.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* ATTACHED PRESENTATION DECK BANNER (IF PRESENT) */}
        {research.uploadedReport && (
          <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-text-muted" />
              <div>
                <h4 className="text-sm font-medium text-text-primary">Attached Final Presentation Deck / Proposal</h4>
                <p className="text-xs text-text-muted">{research.uploadedReport.fileName}</p>
              </div>
            </div>

            <a
              href={research.uploadedReport.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-primary hover:bg-background transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-text-muted" /> Download Document
            </a>
          </div>
        )}

        {/* 1. EXECUTIVE BRIEF */}
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            1. Executive Summary & Problem Framing
          </h2>
          <div className="p-4 rounded-xl bg-surface border border-border text-sm leading-relaxed text-text-secondary">
            {research.executiveSummary || research.recommendations?.suggestedScope || (
              <p>
                Our discovery findings evaluate the strategic requirements, user expectations, and competitor gaps for {research.companyName}. The proposed roadmap outlines key architecture milestones, modern engineering standards, and target deliverables designed to accelerate market adoption.
              </p>
            )}
          </div>
        </div>

        {/* 2. TARGET AUDIENCE & COMPETITOR BENCHMARKING */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-text-primary">
            2. Market Intelligence & Competitor Benchmarking
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Target Audience Persona</h3>
              <p className="text-xs leading-relaxed text-text-secondary">
                {research.marketAnalysis?.targetAudienceSummary || 'Ideal profiles identified across core target demographics seeking modern digital UX and rapid workflow execution.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Market Opportunity & UVP</h3>
              <p className="text-xs leading-relaxed text-text-secondary">
                {research.marketAnalysis?.marketOpportunities || 'Identified white-space in competitor pricing, speed-to-market, and transparent customer experience.'}
              </p>
            </div>
          </div>

          {/* COMPETITOR TABLE */}
          {research.marketAnalysis?.competitors && research.marketAnalysis.competitors.length > 0 && research.marketAnalysis.competitors[0].name && (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="p-3 bg-surface text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border">
                Competitor SWOT Matrix
              </div>
              <div className="divide-y divide-border text-xs">
                {research.marketAnalysis.competitors.map((comp, i) => (
                  <div key={i} className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3 bg-card">
                    <div>
                      <div className="font-semibold text-text-primary">{comp.name}</div>
                      {comp.website && (
                        <div className="text-[11px] text-text-muted">{comp.website}</div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-text-muted">Strengths:</span> {comp.strengths || 'Established brand equity.'}
                    </div>
                    <div>
                      <span className="font-medium text-text-muted">Weaknesses:</span> {comp.weaknesses || 'Legacy user interface, slower support turnaround.'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. DISCOVERY FAQS & INTERVIEW FINDINGS */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-text-primary">
            3. Detailed Discovery Findings & Client Q&A
          </h2>

          {answeredQuestions.length === 0 ? (
            <p className="text-xs text-text-muted italic">
              Discovery questionnaire is currently in progress.
            </p>
          ) : (
            <div className="space-y-5">
              {RESEARCH_CATEGORIES.map(category => {
                const catQuestions = answeredQuestions.filter(q => q.category === category.id);
                if (catQuestions.length === 0) return null;

                return (
                  <div key={category.id} className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border pb-1">
                      {category.label}
                    </h3>
                    <div className="space-y-2.5">
                      {catQuestions.map(q => (
                        <div key={q.id} className="p-3.5 rounded-lg bg-surface border border-border space-y-1">
                          <h4 className="text-xs font-semibold text-text-primary">
                            Q: {q.question}
                          </h4>
                          <p className="text-xs text-text-secondary leading-relaxed pl-2.5 border-l border-border">
                            {q.answer}
                          </p>
                          {q.notes && (
                            <div className="text-[11px] text-text-muted pl-2.5 italic">
                              Internal note: {q.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. RECOMMENDED SCOPE & MILESTONES */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-base font-semibold text-text-primary">
            4. Strategic Project Roadmap & Milestones
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {research.recommendations?.suggestedMilestones?.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface border border-border space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-primary">{m.name}</span>
                  <span className="text-[11px] text-text-muted font-medium">
                    {m.targetWeeks}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {m.description || 'Milestone delivery scope verified during discovery.'}
                </p>
              </div>
            ))}
          </div>

          {/* BUDGET SUMMARY */}
          {research.recommendations?.estimatedBudget > 0 && (
            <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-text-muted font-medium">Estimated Project Budget Allocation</h4>
                <p className="text-xs text-text-muted">Includes discovery, design, development, and launch QA.</p>
              </div>
              <div className="text-lg font-semibold text-text-primary">
                ₹{research.recommendations.estimatedBudget.toLocaleString('en-IN')}
              </div>
            </div>
          )}
        </div>

        {/* REPORT FOOTER */}
        <div className="pt-6 border-t border-border text-center text-xs text-text-muted space-y-0.5">
          <p className="font-medium text-text-primary">Pixels Digital Solutions</p>
          <p>Confidential Client Discovery Document • Prepared for {research.companyName}</p>
        </div>
      </div>
    </div>
  );
}
