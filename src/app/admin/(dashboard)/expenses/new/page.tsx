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
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    paidFrom: 'bank',
    category: 'software',
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
      fetch('/api/projects').then(res => res.json())
    ]).then(([clientsData, projectsData]) => {
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
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
    <div className="p-8 max-w-4xl mx-auto">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Expenses
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Payment Voucher (Expense)</h1>
              <p className="text-sm text-gray-500">Record an outgoing payment</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column: Basic Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Voucher Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paid From (Ledger) *</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${
                    formData.paidFrom === 'cash' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="paidFrom" value="cash" className="sr-only" 
                      checked={formData.paidFrom === 'cash'} 
                      onChange={e => setFormData({...formData, paidFrom: e.target.value})} 
                    />
                    <span className={`font-medium ${formData.paidFrom === 'cash' ? 'text-black' : 'text-gray-500'}`}>Cash in Hand</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${
                    formData.paidFrom === 'bank' ? 'border-black bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="paidFrom" value="bank" className="sr-only" 
                      checked={formData.paidFrom === 'bank'} 
                      onChange={e => setFormData({...formData, paidFrom: e.target.value})} 
                    />
                    <span className={`font-medium ${formData.paidFrom === 'bank' ? 'text-black' : 'text-gray-500'}`}>Bank Account</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black text-xl font-bold"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expense Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                >
                  <option value="software">Software & Subscriptions</option>
                  <option value="hosting">Hosting & Domains</option>
                  <option value="internet">Internet & Utilities</option>
                  <option value="marketing">Marketing & Ads</option>
                  <option value="salary">Salaries</option>
                  <option value="other">Other / General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payee / Vendor Name</label>
                <input
                  type="text"
                  value={formData.vendorName}
                  onChange={e => setFormData({...formData, vendorName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  placeholder="e.g. AWS, Adobe, John Doe"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Allocation & Tagging */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Client & Project Allocation</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag Client (Optional)</label>
                <select
                  value={formData.clientId}
                  onChange={e => {
                    setFormData({...formData, clientId: e.target.value, projectId: ''}); // reset project when client changes
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag Project (Optional)</label>
                <select
                  value={formData.projectId}
                  onChange={e => {
                    const pid = e.target.value;
                    const p = projects.find(pr => pr._id === pid);
                    setFormData({...formData, projectId: pid, clientId: p ? p.clientId : formData.clientId});
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
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
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Ledger Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Particulars / Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  placeholder="Detailed description for ledger..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light resize-none h-24"
                  placeholder="Optional internal notes"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading || !formData.amount}
              className="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
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
