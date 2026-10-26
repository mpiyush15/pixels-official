'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  FileText,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Rocket,
  Trash2,
  ExternalLink,
  Upload,
  ArrowRight,
  Filter,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';

interface ClientResearchItem {
  _id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  clientEmail?: string;
  industry?: string;
  title: string;
  status: 'draft' | 'in_progress' | 'finalized' | 'sent_to_client' | 'converted';
  reportType: 'questions' | 'manual_upload' | 'both';
  uploadedReport?: {
    fileName: string;
    fileUrl: string;
  } | null;
  questions?: Array<{
    id: string;
    answer?: string;
  }>;
  convertedProjectId?: string;
  kickoffDetails?: {
    advancePaidAmount?: number;
    paymentMethod?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ClientOption {
  _id: string;
  name: string;
  company: string;
  email: string;
  industry?: string;
}

export default function ClientResearchHub() {
  const router = useRouter();
  const [researches, setResearches] = useState<ClientResearchItem[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [selectedReportType, setSelectedReportType] = useState<'questions' | 'manual_upload' | 'both'>('questions');

  useEffect(() => {
    fetchResearches();
    fetchClients();
  }, []);

  const fetchResearches = async () => {
    try {
      const res = await fetch('/api/client-research');
      if (res.ok) {
        const data = await res.json();
        setResearches(data);
      }
    } catch (err) {
      console.error('Failed to fetch research items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const handleCreateResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    setCreating(true);
    try {
      const selectedClient = clients.find(c => c._id === selectedClientId);
      const titleToUse = customTitle.trim() || `Market Discovery & Research - ${selectedClient?.company || selectedClient?.name || 'Project'}`;

      const res = await fetch('/api/client-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          title: titleToUse,
          reportType: selectedReportType,
        }),
      });

      const data = await res.json();
      if (data.success && data.researchId) {
        setIsModalOpen(false);
        router.push(`/admin/client-research/${data.researchId}`);
      }
    } catch (err) {
      console.error('Error creating research:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this research study?')) return;

    try {
      const res = await fetch(`/api/client-research/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResearches(prev => prev.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete research:', err);
    }
  };

  // Filtered research studies
  const filtered = researches.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalStudies = researches.length;
  const inProgressCount = researches.filter(r => r.status === 'draft' || r.status === 'in_progress').length;
  const sentCount = researches.filter(r => r.status === 'sent_to_client' || r.status === 'finalized').length;
  const convertedCount = researches.filter(r => r.status === 'converted').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'converted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Rocket className="w-3.5 h-3.5" /> Project Kicked Off
          </span>
        );
      case 'sent_to_client':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Send className="w-3.5 h-3.5" /> Sent via ZeptoMail
          </span>
        );
      case 'finalized':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Report Ready
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> In Discovery
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <FileText className="w-3.5 h-3.5" /> Draft Study
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
              CRM Intelligence
            </span>
            <span className="text-xs text-text-muted">Pre-Project Discovery</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
            Client Research & Market Discovery
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Conduct in-depth market discovery, answer client FAQs, compile research reports, and convert to active projects with advance payments.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>New Research Session</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Researches</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary">{totalStudies}</div>
          <p className="text-xs text-text-muted mt-1">Across all clients</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">In Discovery</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary">{inProgressCount}</div>
          <p className="text-xs text-text-muted mt-1">Active Q&A answering</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Reports Delivered</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary">{sentCount}</div>
          <p className="text-xs text-text-muted mt-1">Emailed via ZeptoMail</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Converted Projects</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Rocket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary">{convertedCount}</div>
          <p className="text-xs text-text-muted mt-1">With advance payments</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR WITH VIEW TOGGLE */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by client, title, company..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* STATUS PILLS & VIEW SWITCHER */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'draft', label: 'Draft' },
              { id: 'in_progress', label: 'In Discovery' },
              { id: 'sent_to_client', label: 'Emailed' },
              { id: 'converted', label: 'Converted' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedStatus === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-background text-text-secondary hover:text-text-primary hover:bg-surface border border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* VIEW SWITCHER */}
          <div className="flex items-center gap-1 p-1 bg-background border border-border rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RESEARCH SESSIONS CONTENT */}
      {loading ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-muted">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Loading Client Research sessions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">No Research Sessions Found</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto mb-5">
            {searchQuery
              ? 'No client research records matched your search query. Try clearing filters.'
              : 'Conduct pre-project discovery, answer client FAQs, benchmark competitors, and compile your first project report.'}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Start First Client Research</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE FORM VIEW (REUSING PIXELS OS TABLE) */
        <div className="ta-table-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border text-sm text-text-muted font-medium">
                  <th className="ta-table-th uppercase">Client / Company</th>
                  <th className="ta-table-th uppercase">Research Study</th>
                  <th className="ta-table-th uppercase text-center">Discovery Progress</th>
                  <th className="ta-table-th uppercase text-center">Status</th>
                  <th className="ta-table-th uppercase text-center">Date</th>
                  <th className="ta-table-th uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => {
                  const answeredCount = item.questions?.filter(q => q.answer && q.answer.trim().length > 0).length || 0;
                  const totalQ = item.questions?.length || 18;
                  const progressPercent = Math.round((answeredCount / totalQ) * 100);

                  return (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => router.push(`/admin/client-research/${item._id}`)}
                      className="hover:bg-surface transition-colors cursor-pointer group"
                    >
                      {/* CLIENT / COMPANY */}
                      <td className="ta-table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                            {item.companyName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                              {item.companyName}
                            </p>
                            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                              <Building className="w-3 h-3 text-primary" />
                              {item.clientName}
                              {item.industry && <span>• {item.industry}</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* RESEARCH TITLE & MODE */}
                      <td className="ta-table-td">
                        <p className="font-semibold text-text-primary text-sm line-clamp-1">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {item.uploadedReport ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                              <Upload className="w-3 h-3" /> Pitch Deck Attached
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                              <FileText className="w-3 h-3" /> Q&A Form
                            </span>
                          )}
                        </div>
                      </td>

                      {/* DISCOVERY PROGRESS */}
                      <td className="ta-table-td text-center">
                        <div className="font-semibold text-xs text-text-primary">
                          {answeredCount}/{totalQ} Answered ({progressPercent}%)
                        </div>
                        <div className="w-28 h-1.5 bg-background rounded-full overflow-hidden border border-border mx-auto mt-1.5">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="ta-table-td text-center">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* DATE */}
                      <td className="ta-table-td text-center text-xs text-text-muted">
                        <span className="flex items-center justify-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="ta-table-td text-right">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => router.push(`/admin/client-research/${item._id}/report`)}
                            title="View Final Report Preview"
                            className="p-1.5 rounded-lg text-text-muted hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          <button
                            onClick={e => handleDelete(item._id, e)}
                            title="Delete Research Study"
                            className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => router.push(`/admin/client-research/${item._id}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm ml-1"
                          >
                            <span>Workspace</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => {
            const answeredCount = item.questions?.filter(q => q.answer && q.answer.trim().length > 0).length || 0;
            const totalQ = item.questions?.length || 18;
            const progressPercent = Math.round((answeredCount / totalQ) * 100);

            return (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push(`/admin/client-research/${item._id}`)}
                className="group relative bg-surface border border-border hover:border-primary/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {item.companyName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary leading-tight group-hover:text-primary transition-colors">
                          {item.companyName}
                        </h4>
                        <p className="text-xs text-text-muted">{item.clientName}</p>
                      </div>
                    </div>

                    <div>{getStatusBadge(item.status)}</div>
                  </div>

                  <h3 className="text-base font-bold text-text-primary mb-2 line-clamp-1">
                    {item.title}
                  </h3>

                  {/* REPORT TYPE BADGES */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-background border border-border text-text-muted">
                      <Building className="w-3 h-3 text-primary" /> {item.industry || 'Digital Tech'}
                    </span>

                    {item.uploadedReport ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Upload className="w-3 h-3" /> Deck Uploaded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <FileText className="w-3 h-3" /> Q&A Form
                      </span>
                    )}
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                      <span>Discovery Q&A</span>
                      <span className="font-semibold text-text-primary">{answeredCount}/{totalQ} Answered ({progressPercent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-border/50">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* CARD FOOTER */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>

                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => router.push(`/admin/client-research/${item._id}/report`)}
                      title="View Report Preview"
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-background transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    <button
                      onClick={e => handleDelete(item._id, e)}
                      title="Delete Study"
                      className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => router.push(`/admin/client-research/${item._id}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all ml-1"
                    >
                      <span>Workspace</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* NEW RESEARCH MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">New Client Research</h3>
                    <p className="text-xs text-text-muted">Initiate pre-project market discovery from CRM</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-background transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateResearch} className="p-6 space-y-4">
                {/* SELECT CLIENT */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Select Client from Directory <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={e => setSelectedClientId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>
                        {client.company || client.name} ({client.name} - {client.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* RESEARCH TITLE */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Research Study Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q4 Web Architecture & Market Discovery"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Leave blank to auto-generate a title based on the selected client.
                  </p>
                </div>

                {/* REPORT CREATION MODE */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Initial Report Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedReportType('questions')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedReportType === 'questions'
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border bg-background text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <FileText className="w-5 h-5 mx-auto mb-1.5" />
                      <div className="text-xs">Q&A Form</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedReportType('manual_upload')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedReportType === 'manual_upload'
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border bg-background text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <Upload className="w-5 h-5 mx-auto mb-1.5" />
                      <div className="text-xs">Upload Deck</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedReportType('both')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedReportType === 'both'
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border bg-background text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <Layers className="w-5 h-5 mx-auto mb-1.5" />
                      <div className="text-xs">Hybrid (Both)</div>
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-background text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !selectedClientId}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md shadow-primary/20"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>Launch Workspace</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
