'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, Calendar, IndianRupee, Edit2, Save, X, Target, FileText, ListTodo, CreditCard } from 'lucide-react';
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
  projectReportUrl?: string;
  projectRevision?: string;
  milestones: Milestone[];
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'milestones' | 'report' | 'timeline'>('milestones');

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
                      <label className="block text-sm font-medium text-text-primary mb-1">Project Report URL</label>
                      <p className="text-xs text-text-muted mb-2">Link to the final report, Google Drive folder, or Figma file.</p>
                      <input type="url" placeholder="https://..." className="ta-input w-full" value={editForm.projectReportUrl || ''} onChange={(e) => setEditForm({...editForm, projectReportUrl: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Current Revision / Version</label>
                      <p className="text-xs text-text-muted mb-2">Track the current version of the deliverables (e.g. v1.2, Final).</p>
                      <input type="text" placeholder="e.g. v1.2" className="ta-input w-full md:w-1/2" value={editForm.projectRevision || ''} onChange={(e) => setEditForm({...editForm, projectRevision: e.target.value})} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-surface/50 p-6 rounded-xl border border-border">
                      <p className="text-sm text-text-muted mb-1">Project Report</p>
                      {project.projectReportUrl ? (
                        <a href={project.projectReportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors">
                          <FileText className="w-5 h-5" /> View Project Report ↗
                        </a>
                      ) : (
                        <p className="text-text-muted italic">No report linked yet.</p>
                      )}
                    </div>
                    
                    <div className="bg-surface/50 p-6 rounded-xl border border-border">
                      <p className="text-sm text-text-muted mb-1">Current Revision</p>
                      <p className="text-xl font-bold text-text-primary">
                        {project.projectRevision || 'N/A'}
                      </p>
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
                            title: 'Project Started',
                            date: project.startDate,
                            description: 'Initial kickoff and planning phase began.',
                            icon: Calendar,
                            colorClass: 'bg-primary text-white border-primary'
                          }
                        ];

                        if (project.milestones) {
                          project.milestones.forEach((m: any, i: number) => {
                            if (m.status === 'completed') {
                              timelineEvents.push({
                                id: `completed-${i}`,
                                title: `Phase Completed: ${m.name}`,
                                date: m.dueDate,
                                description: `Project phase was successfully completed.`,
                                icon: CheckCircle,
                                colorClass: 'bg-green-500 text-white border-green-500'
                              });
                            }
                            if (m.paymentStatus === 'paid') {
                              timelineEvents.push({
                                id: `paid-${i}`,
                                title: `Payment Received: ${m.name}`,
                                date: m.dueDate, // using dueDate as a proxy for timeline sorting
                                description: `Payment of ₹${m.amount} was received and logged.`,
                                icon: CreditCard,
                                colorClass: 'bg-blue-500 text-white border-blue-500'
                              });
                            }
                          });
                        }

                        timelineEvents.push({
                          id: 'end',
                          title: 'Target Completion',
                          date: project.endDate,
                          description: 'Expected delivery date based on current schedule.',
                          icon: Clock,
                          colorClass: 'bg-surface text-text-muted opacity-60'
                        });

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
        </AnimatePresence>
      </div>
    </div>
  );
}
