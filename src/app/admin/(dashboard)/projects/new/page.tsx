'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, IndianRupee } from 'lucide-react';
import Link from 'next/link';

interface Client {
  _id: string;
  name: string;
  email: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    projectName: '',
    projectType: 'Website Development',
    status: 'planning',
    startDate: '',
    endDate: '',
    description: '',
    budget: '',
    milestones: [] as { name: string; dueDate: string; amount: string; paymentStatus: string }[],
  });

  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error(err));
  }, []);

  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { name: '', dueDate: '', amount: '', paymentStatus: 'unpaid' },
      ],
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    
    // Auto-recalculate budget based on milestones if user wants, 
    // or we can just let them enter budget manually.
    const newBudget = newMilestones.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

    setFormData((prev) => ({
      ...prev,
      milestones: newMilestones,
      budget: newBudget > 0 ? newBudget.toString() : prev.budget,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget) || 0,
          milestones: formData.milestones.map((m) => ({
            ...m,
            amount: parseFloat(m.amount) || 0,
            status: 'pending',
          })),
        }),
      });

      if (response.ok) {
        router.push('/admin/projects');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create project');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects" className="p-2 bg-surface hover:bg-surface/80 rounded-lg text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Create New Project</h1>
            <p className="text-sm text-text-muted mt-1">Setup project details, phases, and billing.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="ta-card space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border pb-3">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Project Name *</label>
              <input
                type="text"
                required
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="ta-input w-full"
                placeholder="e.g. E-commerce Redesign"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Client *</label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="ta-input w-full"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Project Type</label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                className="ta-input w-full"
              >
                <option value="Website Development">Website Development</option>
                <option value="E-commerce Development">E-commerce Development</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="SEO Services">SEO Services</option>
                <option value="Social Media Marketing">Social Media Marketing</option>
                <option value="Video Production">Video Production</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Branding">Branding</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="ta-input w-full"
              >
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="ta-input w-full"
                placeholder="Briefly describe the project scope and goals..."
              />
            </div>
          </div>
        </div>

        <div className="ta-card space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border pb-3">Timeline & Budget</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="ta-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="ta-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Total Budget (₹) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="h-4 w-4 text-text-muted" />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="ta-input w-full pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="ta-card space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-semibold text-text-primary">Phases & Payment Milestones</h2>
            <button
              type="button"
              onClick={addMilestone}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Phase
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {formData.milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-surface/30 rounded-xl border border-border"
              >
                <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-text-muted mb-1">Phase Name</label>
                  <input
                    type="text"
                    required
                    value={milestone.name}
                    onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                    className="ta-input w-full text-sm py-2"
                    placeholder="e.g. 50% Advance Payment"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-text-muted mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={milestone.dueDate}
                    onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                    className="ta-input w-full text-sm py-2"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-text-muted mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={milestone.amount}
                    onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                    className="ta-input w-full text-sm py-2"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
            {formData.milestones.length === 0 && (
              <div className="text-center py-8 text-text-muted text-sm border border-dashed border-border rounded-xl">
                No phases added yet. Click 'Add Phase' to break down the project timeline and payments.
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-8">
          <Link
            href="/admin/projects"
            className="px-6 py-2.5 rounded-lg border border-border text-text-primary hover:bg-surface font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg ta-btn-primary font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Project...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
