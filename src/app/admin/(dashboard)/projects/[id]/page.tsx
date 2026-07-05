'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, Calendar, IndianRupee, Edit2, Save, X, Target, FileText, ListTodo, CreditCard, MessageSquare, Mail } from 'lucide-react';
import Link from 'next/link';

interface Milestone {
  name: string;
  dueDate: string;
  amount: string | number;
  paymentStatus: 'unpaid' | 'paid';
  status: 'pending' | 'in-progress' | 'completed';
  paymentAccountId?: string;
}

interface Project {
  _id: string;
  projectName: string;
  projectType: string;
  status: string;
  progress: number;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  clientEmail?: string;
  projectReportText?: string;
  projectRevision?: string;
  agreementText?: string;
  milestones: Milestone[];
  whatsappPhoneNumberId?: string;
  whatsappBusinessAccountId?: string;
  whatsappAccessToken?: string;
  whatsappPhoneNumber?: string;
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'milestones' | 'report' | 'timeline' | 'whatsapp'>('milestones');

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Project>>({});

  // Finance integration
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchProject();
    fetchAccounts();
  }, [id]);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/finance/accounts');
      if (res.ok) {
        const allAccounts = await res.json();
        setAccounts(allAccounts.filter((a: any) => a.subType === 'Bank' || a.subType === 'Cash'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setEditForm(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setIsEditing(false);
        fetchProject();
      } else {
        alert('Failed to save project');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
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
          <div><strong>Project Type:</strong> ${project.projectType || 'N/A'}</div>
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

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const newMilestones = [...(editForm.milestones || [])];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setEditForm({ ...editForm, milestones: newMilestones });
  };

  const addMilestone = () => {
    const newMilestones = [...(editForm.milestones || [])];
    newMilestones.push({
      name: 'New Phase',
      dueDate: editForm.endDate || new Date().toISOString(),
      amount: 0,
      paymentStatus: 'unpaid',
      status: 'pending'
    });
    setEditForm({ ...editForm, milestones: newMilestones });
  };

  const removeMilestone = (index: number) => {
    const newMilestones = [...(editForm.milestones || [])];
    newMilestones.splice(index, 1);
    setEditForm({ ...editForm, milestones: newMilestones });
  };

  const markPaymentPaid = async (index: number) => {
    if (!project) return;
    const accountId = selectedAccounts[index];
    if (!accountId) {
      alert("Please select a payment method (Bank/Cash account) first.");
      return;
    }

    const newMilestones = [...project.milestones];
    newMilestones[index].paymentStatus = 'paid';
    newMilestones[index].paymentAccountId = accountId;
    
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestones: newMilestones }),
      });
      if (res.ok) fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-text-muted">Loading project details...</div>;
  if (!project) return <div className="p-8 text-danger">Project not found</div>;

  const tabs = [
    { id: 'milestones', label: 'Milestones', icon: Target },
    { id: 'report', label: 'Project Report', icon: FileText },
    { id: 'timeline', label: 'Project Timeline', icon: ListTodo },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects" className="p-2 bg-surface hover:bg-surface/80 rounded-lg text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{project.projectName}</h1>
            <p className="text-sm text-text-muted mt-1">{project.projectType} • {project.clientEmail}</p>
          </div>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="ta-btn-primary flex items-center gap-2">
            <Edit2 className="w-4 h-4" /> Edit Project
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setIsEditing(false); setEditForm(project); }} className="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="ta-btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 bg-surface/50 p-1 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive ? 'bg-background shadow-sm text-primary' : 'text-text-muted hover:text-text-primary hover:bg-background/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: MILESTONES */}
          {activeTab === 'milestones' && (
            <motion.div key="milestones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                  <div className="ta-card space-y-4">
                    <h2 className="text-lg font-semibold text-text-primary border-b border-border pb-3">Project Overview</h2>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-text-muted mb-1">Project Name</label>
                          <input type="text" className="ta-input w-full" value={editForm.projectName} onChange={(e) => setEditForm({...editForm, projectName: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm text-text-muted mb-1">Description</label>
                          <textarea className="ta-input w-full" rows={3} value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-text-muted mb-1">Status</label>
                            <select className="ta-input w-full" value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})}>
                              <option value="planning">Planning</option>
                              <option value="in-progress">In Progress</option>
                              <option value="review">In Review</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-text-muted mb-1">Total Budget</label>
                            <input type="number" className="ta-input w-full" value={editForm.budget} onChange={(e) => setEditForm({...editForm, budget: parseFloat(e.target.value) || 0})} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-text-muted mb-1">Overall Work Progress (%)</label>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range" 
                              min="0" max="100" 
                              className="w-full accent-primary" 
                              value={editForm.progress || 0} 
                              onChange={(e) => setEditForm({...editForm, progress: parseInt(e.target.value)})} 
                            />
                            <span className="font-bold text-text-primary w-12 text-right">{editForm.progress || 0}%</span>
                          </div>
                          <p className="text-xs text-text-muted mt-1">Manually adjust the progress during phases.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 text-sm">
                        <p className="text-text-secondary leading-relaxed">{project.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                          <div>
                            <p className="text-text-muted text-xs">Status</p>
                            <p className="font-medium text-text-primary capitalize">{project.status.replace('-', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-text-muted text-xs">Total Budget</p>
                            <p className="font-medium text-text-primary flex items-center">
                              <IndianRupee className="w-3 h-3 mr-1" />{project.budget?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="lg:col-span-3">
                  <div className="ta-card">
                    <h2 className="text-lg font-semibold text-text-primary border-b border-border pb-3 mb-4">Milestones & Payments</h2>
                    <div className="space-y-4">
                      {isEditing && (
                        <div className="flex justify-end">
                          <button onClick={addMilestone} className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
                            + Add New Phase
                          </button>
                        </div>
                      )}
                      {(isEditing ? editForm.milestones : project.milestones)?.map((milestone, i) => (
                        <div key={i} className="p-5 bg-background/50 border border-border rounded-xl relative">
                          {isEditing && (
                            <button onClick={() => removeMilestone(i)} className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          {isEditing ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pr-8">
                              <div className="col-span-2">
                                <label className="block text-xs text-text-muted mb-1">Phase Name / Detail</label>
                                <input type="text" className="ta-input w-full py-1.5 text-sm" value={milestone.name} onChange={(e) => updateMilestone(i, 'name', e.target.value)} />
                              </div>
                              <div>
                                <label className="block text-xs text-text-muted mb-1">Amount</label>
                                <input type="number" className="ta-input w-full py-1.5 text-sm" value={milestone.amount} onChange={(e) => updateMilestone(i, 'amount', e.target.value)} />
                              </div>
                              <div>
                                <label className="block text-xs text-text-muted mb-1">Expected Date</label>
                                <input type="date" className="ta-input w-full py-1.5 text-sm" value={milestone.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : ''} onChange={(e) => updateMilestone(i, 'dueDate', new Date(e.target.value).toISOString())} />
                              </div>
                              <div className="col-span-2 md:col-span-4">
                                <label className="block text-xs text-text-muted mb-1">Work Status</label>
                                <select className="ta-input py-1.5 text-sm w-48" value={milestone.status} onChange={(e) => updateMilestone(i, 'status', e.target.value as any)}>
                                  <option value="pending">Pending</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <h4 className="font-semibold text-text-primary text-base">{milestone.name}</h4>
                                <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                                  <span className="flex items-center gap-1 bg-surface px-2 py-1 rounded-md"><Calendar className="w-3.5 h-3.5 text-primary"/> {new Date(milestone.dueDate).toLocaleDateString()}</span>
                                  <span className="flex items-center gap-1 font-medium"><IndianRupee className="w-3 h-3"/> {Number(milestone.amount).toLocaleString()}</span>
                                  <span className={`px-2.5 py-1 rounded-full font-medium ${milestone.status === 'completed' ? 'bg-success/10 text-success' : milestone.status === 'in-progress' ? 'bg-primary/10 text-primary' : 'bg-surface text-text-muted'}`}>
                                    {milestone.status}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 bg-surface p-3 rounded-lg">
                                {milestone.paymentStatus === 'paid' ? (
                                  <span className="flex items-center gap-1.5 text-sm text-success bg-success/10 px-4 py-2 rounded-lg font-bold">
                                    <CheckCircle className="w-5 h-5" /> Payment Received
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <select 
                                      className="ta-input py-1.5 text-sm w-full md:w-auto min-w-[160px]"
                                      value={selectedAccounts[i] || ''}
                                      onChange={(e) => setSelectedAccounts({...selectedAccounts, [i]: e.target.value})}
                                    >
                                      <option value="">Select Account to Receive In...</option>
                                      {accounts.map(acc => (
                                        <option key={acc._id} value={acc._id}>{acc.name} ({acc.subType})</option>
                                      ))}
                                    </select>
                                    <button 
                                      onClick={() => markPaymentPaid(i)}
                                      className="flex items-center gap-1 text-sm text-white bg-success hover:bg-success/90 px-4 py-2 rounded-lg font-medium transition-colors"
                                      title="Mark as paid to sync with Finance Revenue"
                                    >
                                      Log Payment
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PROJECT REPORT */}
          {activeTab === 'report' && (
            <motion.div key="report" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="ta-card max-w-3xl">
                <h2 className="text-lg font-semibold text-text-primary border-b border-border pb-3 mb-4">Project Deliverables & Reports</h2>
                
                {isEditing ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Project Report</label>
                      <p className="text-xs text-text-muted mb-2">Detailed report, deliverables, or summary of the project.</p>
                      <textarea rows={6} placeholder="Type the full project report here..." className="ta-input w-full" value={editForm.projectReportText || ''} onChange={(e) => setEditForm({...editForm, projectReportText: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Current Revision / Version</label>
                      <p className="text-xs text-text-muted mb-2">Track the current version of the deliverables (e.g. v1.2, Final).</p>
                      <input type="text" placeholder="e.g. v1.2" className="ta-input w-full md:w-1/2" value={editForm.projectRevision || ''} onChange={(e) => setEditForm({...editForm, projectRevision: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Project Agreement / Terms</label>
                      <p className="text-xs text-text-muted mb-2">The contract text the client needs to agree to.</p>
                      <textarea rows={6} className="ta-input w-full font-mono text-sm" value={editForm.agreementText || ''} onChange={(e) => setEditForm({...editForm, agreementText: e.target.value})} placeholder="Enter the full contract terms here..." />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-surface/50 p-6 rounded-xl border border-border">
                      <p className="text-sm font-semibold text-text-primary mb-3">Project Report</p>
                      {project.projectReportText ? (
                        <div className="bg-white p-4 border border-border rounded-lg text-sm text-text-secondary whitespace-pre-wrap">
                          {project.projectReportText}
                        </div>
                      ) : (
                        <p className="text-text-muted italic text-sm">No project report has been written yet.</p>
                      )}
                    </div>
                    
                    <div className="bg-surface/50 p-6 rounded-xl border border-border">
                      <p className="text-sm text-text-muted mb-1">Current Revision</p>
                      <p className="text-xl font-bold text-text-primary">
                        {project.projectRevision || 'N/A'}
                      </p>
                    </div>

                    <div className="bg-surface/50 p-6 rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-text-primary">Project Agreement / Terms</p>
                        <button 
                          onClick={handleDownloadAgreement}
                          className="text-xs flex items-center gap-1 bg-white border border-border px-3 py-1.5 rounded-md hover:bg-gray-50 text-text-primary font-medium transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Download PDF
                        </button>
                      </div>
                      <div className="bg-white p-4 border border-border rounded-lg h-48 overflow-y-auto text-sm text-text-secondary whitespace-pre-wrap font-mono">
                        {project.agreementText || 'Standard terms and conditions apply.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: PROJECT TIMELINE */}
          {activeTab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="ta-card">
                  <h2 className="text-lg font-semibold text-text-primary border-b border-border pb-3 mb-4">Timeline & Schedule</h2>
                  {isEditing ? (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Start Date</label>
                        <input type="date" className="ta-input w-full" value={editForm.startDate?.split('T')[0]} onChange={(e) => setEditForm({...editForm, startDate: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Expected End Date</label>
                        <input type="date" className="ta-input w-full" value={editForm.endDate?.split('T')[0]} onChange={(e) => setEditForm({...editForm, endDate: e.target.value})} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      {(() => {
                        const timelineEvents = [
                          {
                            id: 'start',
                            title: 'Project Setup Initiated',
                            date: (project as any).createdAt || project.startDate,
                            description: 'Project was created in the system.',
                            icon: Calendar,
                            colorClass: 'bg-primary text-white border-primary'
                          }
                        ];

                        if ((project as any).activityLog && (project as any).activityLog.length > 0) {
                          (project as any).activityLog.forEach((log: any) => {
                            let icon = Calendar;
                            let colorClass = 'bg-gray-500 text-white border-gray-500';
                            
                            if (log.type === 'email') {
                              icon = Mail;
                              colorClass = 'bg-blue-400 text-white border-blue-400';
                            } else if (log.type === 'payment') {
                              icon = CreditCard;
                              colorClass = 'bg-green-500 text-white border-green-500';
                            } else if (log.type === 'contract') {
                              icon = CheckCircle;
                              colorClass = 'bg-indigo-500 text-white border-indigo-500';
                            } else if (log.type === 'system') {
                              icon = CheckCircle;
                              colorClass = 'bg-purple-500 text-white border-purple-500';
                            }

                            timelineEvents.push({
                              id: log.id || Math.random().toString(),
                              title: log.title,
                              date: log.date,
                              description: log.description,
                              icon,
                              colorClass
                            });
                          });
                        }

                        // Also include milestone completions if not logged explicitly
                        if (project.milestones) {
                          project.milestones.forEach((m: any, i: number) => {
                            if (m.status === 'completed') {
                              timelineEvents.push({
                                id: `completed-${i}`,
                                title: `Phase Completed: ${m.name}`,
                                date: m.dueDate, // or m.completedAt if available
                                description: `Project phase was successfully completed.`,
                                icon: CheckCircle,
                                colorClass: 'bg-emerald-500 text-white border-emerald-500'
                              });
                            }
                          });
                        }

                        if (project.status !== 'completed' && project.endDate) {
                          timelineEvents.push({
                            id: 'end',
                            title: 'Target Completion',
                            date: project.endDate,
                            description: 'Expected delivery date based on current schedule.',
                            icon: Clock,
                            colorClass: 'bg-surface text-text-muted opacity-60'
                          });
                        }

                        // Sort chronologically
                        timelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                        return timelineEvents.map((event, index) => {
                          const Icon = event.icon;
                          return (
                            <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${event.colorClass}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-background p-4 rounded-xl border border-border shadow-sm">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                  <div className="font-bold text-text-primary">{event.title}</div>
                                  <time className="text-xs font-medium text-text-muted">{new Date(event.date).toLocaleDateString()}</time>
                                </div>
                                <div className="text-sm text-text-muted">{event.description}</div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                <div className="ta-card flex flex-col justify-center items-center">
                  <h2 className="text-lg font-semibold text-text-primary w-full border-b border-border pb-3 mb-8">Work Progress</h2>
                  
                  <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-[12px] border-surface">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="84" cy="84" r="78" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-border" />
                      <circle cx="84" cy="84" r="78" fill="transparent" stroke="currentColor" strokeWidth="12" 
                        strokeDasharray={490} 
                        strokeDashoffset={490 - (490 * project.progress) / 100} 
                        className="text-primary transition-all duration-1000" 
                      />
                    </svg>
                    <div className="text-center">
                      <span className="text-5xl font-bold text-text-primary">{project.progress || 0}%</span>
                      <p className="text-sm text-text-muted mt-1">Completed Work</p>
                    </div>
                  </div>
                  <p className="text-center text-text-muted mt-8 max-w-sm">
                    Progress is manually updated during phases. Click "Edit Project" to adjust the percentage.
                  </p>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <motion.div key="whatsapp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="ta-card max-w-3xl">
                <h2 className="text-lg font-semibold text-text-primary border-b border-border pb-3 mb-4">WhatsApp API Configuration</h2>
                
                {isEditing ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">WhatsApp Phone Number ID</label>
                      <input type="text" className="ta-input w-full" value={editForm.whatsappPhoneNumberId || ''} onChange={(e) => setEditForm({...editForm, whatsappPhoneNumberId: e.target.value})} placeholder="e.g. 123456789012345" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">WhatsApp Business Account ID (WABA ID)</label>
                      <input type="text" className="ta-input w-full" value={editForm.whatsappBusinessAccountId || ''} onChange={(e) => setEditForm({...editForm, whatsappBusinessAccountId: e.target.value})} placeholder="e.g. 123456789012345" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">System Access Token (Optional)</label>
                      <p className="text-xs text-text-muted mb-2">Leave blank to use the default system token from .env</p>
                      <input type="text" className="ta-input w-full" value={editForm.whatsappAccessToken || ''} onChange={(e) => setEditForm({...editForm, whatsappAccessToken: e.target.value})} placeholder="EAAd..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Display Phone Number (Optional)</label>
                      <input type="text" className="ta-input w-full" value={editForm.whatsappPhoneNumber || ''} onChange={(e) => setEditForm({...editForm, whatsappPhoneNumber: e.target.value})} placeholder="e.g. +91 9876543210" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-surface/50 p-6 rounded-xl border border-border">
                      <p className="text-sm font-semibold text-text-primary mb-3">Connection Details</p>
                      {!project.whatsappPhoneNumberId && !project.whatsappBusinessAccountId ? (
                        <p className="text-text-muted italic text-sm">WhatsApp API is not connected to this project yet. Click "Edit Project" to add credentials.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-text-muted">Phone Number ID</p>
                            <p className="font-medium text-text-primary">{project.whatsappPhoneNumberId || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted">WABA ID</p>
                            <p className="font-medium text-text-primary">{project.whatsappBusinessAccountId || 'N/A'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-xs text-text-muted">Access Token</p>
                            <p className="font-mono text-xs text-text-primary truncate">{project.whatsappAccessToken ? project.whatsappAccessToken.substring(0, 20) + '...' : 'Using Default .env Token'}</p>
                          </div>
                          {project.whatsappPhoneNumber && (
                            <div>
                              <p className="text-xs text-text-muted">Display Phone</p>
                              <p className="font-medium text-text-primary">{project.whatsappPhoneNumber}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
