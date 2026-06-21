'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Receipt } from 'lucide-react';

interface Client {
  _id: string;
  name: string;
  company: string;
}

interface Project {
  _id: string;
  clientId: string;
  name: string;
  projectName: string;
}

export default function NewExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [expenseAccounts, setExpenseAccounts] = useState<any[]>([]);
  const [assetAccounts, setAssetAccounts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    paidFrom: '',
    expenseAccountId: '',
    amount: '',
    vendorName: '',
    clientId: '',
    projectId: '',
    description: '',
    paymentMethod: 'bank_transfer',
    notes: ''
  });

  useEffect(() => {
    // Fetch clients and projects for tagging
    Promise.all([
      fetch('/api/clients').then(res => res.json()),
      fetch('/api/projects').then(res => res.json()),
      fetch('/api/finance/accounts').then(res => res.json())
    ]).then(([clientsData, projectsData, accountsData]) => {
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      
      const accs = Array.isArray(accountsData) ? accountsData : [];
      setExpenseAccounts(accs.filter(a => a.type === 'Expense'));
      setAssetAccounts(accs.filter(a => a.type === 'Asset' && (a.subType === 'Bank' || a.subType === 'Cash')));
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedClient = clients.find(c => c._id === formData.clientId);
      const selectedProject = projects.find(p => p._id === formData.projectId);

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          clientName: selectedClient?.company || selectedClient?.name || '',
          projectName: selectedProject?.projectName || selectedProject?.name || '',
          category: expenseAccounts.find(a => a._id === formData.expenseAccountId)?.name || 'Direct Expense',
          paymentStatus: 'paid'
        }),
      });

      if (!response.ok) throw new Error('Failed to create expense');
      
      router.push('/admin/expenses');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving expense');
      setLoading(false);
    }
  };

  const filteredProjects = formData.clientId 
    ? projects.filter(p => p.clientId === formData.clientId)
    : projects;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => router.back()}
        className="p-2 bg-surface hover:bg-surface/80 rounded-lg text-text-muted hover:text-text-primary transition-colors inline-flex"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="ta-card overflow-hidden !p-0">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-danger/10 text-danger rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-text-primary">Payment Voucher (Expense)</h1>
              <p className="text-sm text-text-muted">Record an outgoing payment directly to the ledger</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column: Basic Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Voucher Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="ta-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Paid From (Bank/Cash) *</label>
                <select
                  required
                  value={formData.paidFrom}
                  onChange={e => setFormData({...formData, paidFrom: e.target.value})}
                  className="ta-input w-full"
                >
                  <option value="">Select Payment Source...</option>
                  {assetAccounts.map(acc => (
                    <option key={acc._id} value={acc._id}>{acc.name} ({acc.subType})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                  className="ta-input w-full"
                >
                  <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="upi">UPI</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="cash">Physical Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </div>

            {/* Right Column: Particulars & Amounts */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Total Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="ta-input w-full text-xl font-bold"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Expense Category (Ledger Account) *</label>
                <select
                  required
                  value={formData.expenseAccountId}
                  onChange={e => setFormData({...formData, expenseAccountId: e.target.value})}
                  className="ta-input w-full"
                >
                  <option value="">Select Expense Account...</option>
                  {expenseAccounts.map(acc => (
                    <option key={acc._id} value={acc._id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Payee / Vendor Name</label>
                <input
                  type="text"
                  value={formData.vendorName}
                  onChange={e => setFormData({...formData, vendorName: e.target.value})}
                  className="ta-input w-full"
                  placeholder="e.g. AWS, Adobe, John Doe"
                />
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Allocation & Tagging */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border pb-2">Client & Project Allocation</h3>
              
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Tag Client (Optional)</label>
                <select
                  value={formData.clientId}
                  onChange={e => {
                    setFormData({...formData, clientId: e.target.value, projectId: ''}); // reset project when client changes
                  }}
                  className="ta-input w-full"
                >
                  <option value="">-- General Business Expense --</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.company || client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Tag Project (Optional)</label>
                <select
                  value={formData.projectId}
                  onChange={e => {
                    const pid = e.target.value;
                    const p = projects.find(pr => pr._id === pid);
                    setFormData({...formData, projectId: pid, clientId: p ? p.clientId : formData.clientId});
                  }}
                  className="ta-input w-full"
                  disabled={projects.length === 0}
                >
                  <option value="">-- No Specific Project --</option>
                  {filteredProjects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.projectName || project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border pb-2">Ledger Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Particulars / Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="ta-input w-full"
                  placeholder="Detailed description for ledger..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Internal Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="ta-input w-full resize-none h-24"
                  placeholder="Optional internal notes"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={loading || !formData.amount}
              className="ta-btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Voucher...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Expense Voucher
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
