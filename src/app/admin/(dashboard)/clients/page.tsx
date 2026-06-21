"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Mail,
  Phone,
  Building,
  Edit,
  Trash2,
  X,
  Send,
  UserCheck,
  UserX,
  Key,
  Lock,
  ChevronRight
} from "lucide-react";

// ----------------------------
// INTERFACES
// ----------------------------
interface Client {
  _id: string;
  salutation?: "Mr." | "Mrs." | "Miss" | "Dr." | "Ms.";
  name: string;
  email: string;
  phone: string;
  company: string;
  industry?: string;
  address?: string;
  totalRevenue: number;
  projectsCount: number;
  status: "active" | "inactive";
  createdAt: string;
  portalAccessEnabled?: boolean;
  clientType?: "development" | "other"; // New field
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: string;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  issueDate: string;
  dueDate: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSendLoginModal, setShowSendLoginModal] = useState(false);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [passwordClient, setPasswordClient] = useState<Client | null>(null);
  const [sendLoginClient, setSendLoginClient] = useState<Client | null>(null);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  const [sendingWelcomeEmail, setSendingWelcomeEmail] = useState<string | null>(null);
  const [sendingLoginEmail, setSendingLoginEmail] = useState<string | null>(null);
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [sendLoginError, setSendLoginError] = useState("");

  const emptyForm = {
    salutation: "Mr." as "Mr." | "Mrs." | "Miss" | "Dr." | "Ms.",
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    address: "",
    status: "active" as "active" | "inactive",
    clientType: "development" as "development" | "other"
  };

  const [formData, setFormData] = useState(emptyForm);

  // ----------------------------
  // FETCHING FUNCTIONS
  // ----------------------------

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchClients(), fetchInvoices()]);
      setLoading(false);
    })();
  }, []);

  // ----------------------------
  // FORM SUBMIT
  // ----------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingClient ? `/api/clients/${editingClient._id}` : "/api/clients";
    const method = editingClient ? "PATCH" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      setShowAddModal(false);
      setEditingClient(null);
      setFormData(emptyForm);
      fetchClients();
    } catch (err) {
      console.error("Error saving client:", err);
    }
  };

  // ----------------------------
  // EDIT / VIEW / DELETE
  // ----------------------------

  const handleEdit = (c: Client) => {
    setEditingClient(c);
    setFormData({
      salutation: c.salutation || "Mr.",
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      industry: c.industry || "",
      address: c.address || "",
      status: c.status,
      clientType: c.clientType || "development"
    });
    setShowAddModal(true);
  };

  const handleView = (c: Client) => {
    router.push(`/admin/clients/${c._id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client?")) return;

    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
      fetchClients();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const sendWelcomeEmail = async (client: Client) => {
    if (!client.email) {
      alert("This client has no email address");
      return;
    }

    try {
      setSendingWelcomeEmail(client._id);
      const response = await fetch(
        `/api/test-welcome-email?email=${encodeURIComponent(client.email)}&name=${encodeURIComponent(client.name)}`
      );
      const result = await response.json();
      
      if (result.success) {
        alert("Welcome email sent successfully!");
      } else {
        alert("Failed to send email: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error sending welcome email:", error);
      alert("Failed to send welcome email");
    } finally {
      setSendingWelcomeEmail(null);
    }
  };

  const toggleClientStatus = async (client: Client) => {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    
    if (!confirm(`Mark ${client.name} as ${newStatus}?`)) return;

    try {
      await fetch(`/api/clients/${client._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchClients();
    } catch (err) {
      console.error("Error updating client status:", err);
    }
  };



  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (!passwordClient) return;

    try {
      const res = await fetch(`/api/clients/${passwordClient._id}/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        alert(`Portal access enabled for ${passwordClient.name}!\n\nLogin Details:\nEmail: ${passwordClient.email}\nPassword: (as set)\n\nClient Portal: ${window.location.origin}/client-portal/login`);
        setShowPasswordModal(false);
        setPassword("");
        setConfirmPassword("");
        setPasswordClient(null);
        fetchClients();
      } else {
        const data = await res.json();
        setPasswordError(data.error || "Failed to set password");
      }
    } catch (err) {
      console.error("Error setting password:", err);
      setPasswordError("Failed to set password");
    }
  };

  const openPasswordModal = (client: Client) => {
    setPasswordClient(client);
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const openSendLoginModal = (client: Client) => {
    setSendLoginClient(client);
    setSendLoginError("");
    setShowSendLoginModal(true);
  };

  const handleSendLoginCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendLoginError("");

    if (!sendLoginClient) return;

    try {
      setSendingLoginEmail(sendLoginClient._id);
      const res = await fetch(
        `/api/clients/${sendLoginClient._id}/send-login-credentials`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert(
          `✅ Login credentials sent successfully!\n\nEmail sent to: ${sendLoginClient.email}\n\nThe email contains:\n• Portal login link\n• Email address\n• 8-digit numeric password\n• Security tips\n\nClient can now login and change password if needed.`
        );
        setShowSendLoginModal(false);
        setSendLoginClient(null);
        setSendLoginError("");
      } else {
        setSendLoginError(data.error || "Failed to send login credentials");
      }
    } catch (err) {
      console.error("Error sending login credentials:", err);
      setSendLoginError("Failed to send login credentials");
    } finally {
      setSendingLoginEmail(null);
    }
  };

  const statusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "draft":
        return "bg-surface text-text-muted";
      case "sent":
        return "bg-blue-100 text-blue-700";
      case "paid":
        return "bg-green-100 text-green-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-surface text-text-muted";
    }
  };

  // ----------------------------
  // RENDER
  // ----------------------------

  return (
    <div className="p-8 bg-background min-h-[calc(100vh-8rem)] rounded-2xl">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-medium">Clients Management</h1>
          <p className="text-text-muted font-medium">
            Manage all client details & billing
          </p>
        </div>

        <motion.button
          onClick={() => {
            setEditingClient(null);
            setFormData(emptyForm);
            setShowAddModal(true);
          }}
          whileHover={{ scale: 1.05 }}
          className="ta-btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </motion.button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="ta-card">
          <p className="text-text-muted text-sm">Total Clients</p>
          <p className="text-3xl mt-2">{clients.length}</p>
        </div>
        <div className="ta-card">
          <p className="text-text-muted text-sm">Active Clients</p>
          <p className="text-3xl mt-2">
            {clients.filter((c) => c.status === "active").length}
          </p>
        </div>
        <div className="ta-card">
          <p className="text-text-muted text-sm">Total Revenue</p>
          <p className="text-3xl mt-2">
            ₹
            {clients
              .reduce((sum, c) => sum + c.totalRevenue, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>
      {/* CLIENT TABLE */}
      {loading ? (
        <p className="text-center text-text-muted py-10">Loading clients...</p>
      ) : clients.length === 0 ? (
        <div className="ta-card text-center p-10">
          <p className="text-text-muted mb-4">No clients yet.</p>
          <button
            onClick={() => {
              setEditingClient(null);
              setFormData(emptyForm);
              setShowAddModal(true);
            }}
            className="ta-btn-primary"
          >
            Add your first client
          </button>
        </div>
      ) : (
        <div className="ta-table-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border text-sm text-text-muted font-medium">
                  <th className="ta-table-th uppercase">Client / Company</th>
                  <th className="ta-table-th uppercase">Contact</th>
                  <th className="ta-table-th uppercase text-center">Projects</th>
                  <th className="ta-table-th uppercase text-right">Revenue</th>
                  <th className="ta-table-th uppercase text-center">Status</th>
                  <th className="ta-table-th uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <AnimatePresence mode="popLayout">
                  {clients.map((client) => (
                    <motion.tr 
                      key={client._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="hover:bg-surface transition-colors cursor-pointer group border-b border-border"
                      onClick={() => handleView(client)}
                    >
                      <td className="ta-table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-muted font-medium shrink-0">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary group-hover:text-primary transition-colors">
                              {client.name}
                            </p>
                            <p className="text-sm text-text-muted flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3" />
                              {client.company}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="ta-table-td text-sm">
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-text-muted">
                            <Mail className="w-3.5 h-3.5" />
                            {client.email}
                          </p>
                          {client.phone && (
                            <p className="flex items-center gap-2 text-text-muted">
                              <Phone className="w-3.5 h-3.5" />
                              {client.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="ta-table-td text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-border text-sm font-medium text-text-muted">
                          {client.projectsCount}
                        </span>
                      </td>
                      <td className="ta-table-td text-right font-medium text-text-primary">
                        ₹{client.totalRevenue.toLocaleString('en-IN')}
                      </td>
                      <td className="ta-table-td text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase ${
                            client.status === "active"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-surface text-text-muted"
                          }`}
                        >
                          {client.status}
                        </span>
                        {client.portalAccessEnabled && (
                          <div className="mt-1 flex items-center justify-center" title="Portal Access Enabled">
                            <Lock className="w-3 h-3 text-blue-500" />
                          </div>
                        )}
                      </td>
                      <td className="ta-table-td text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openPasswordModal(client)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              client.portalAccessEnabled
                                ? 'text-purple-500 hover:bg-purple-500/10'
                                : 'text-text-muted hover:text-blue-500 hover:bg-blue-500/10'
                            }`}
                            title={client.portalAccessEnabled ? 'Reset Portal Password' : 'Enable Portal Access'}
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openSendLoginModal(client)}
                            disabled={!client.email || sendingLoginEmail === client._id}
                            className="p-1.5 rounded-lg text-text-muted hover:text-blue-500 hover:bg-blue-500/10 disabled:opacity-50 transition-colors"
                            title="Send Login Credentials"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <div className="w-px h-4 bg-surface/50 mx-1" />
                          <button
                            onClick={() => handleEdit(client)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
                            title="Edit Client"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(client._id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="pl-2 ml-1 border-l border-border">
                            <ChevronRight className="w-5 h-5 text-text-muted/70 group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD/EDIT CLIENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-medium text-text-primary">
                {editingClient ? "Edit Client" : "Add New Client"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingClient(null);
                }}
                className="p-2 hover:bg-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted font-medium mb-2">
                    Salutation *
                  </label>
                  <select
                    value={formData.salutation}
                    onChange={(e) =>
                      setFormData({ ...formData, salutation: e.target.value as "Mr." | "Mrs." | "Miss" | "Dr." | "Ms." })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                    required
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Miss">Miss</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-muted font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted font-medium mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted font-medium mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted font-medium mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted font-medium mb-2">
                    Client Type
                  </label>
                  <select
                    value={formData.clientType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clientType: e.target.value as "development" | "other"
                      })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                  >
                    <option value="development">Development Client</option>
                    <option value="other">Other Services</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted font-medium mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "active" | "inactive"
                      })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-muted font-medium mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-black transition-colors font-medium resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingClient(null);
                  }}
                  className="flex-1 px-6 py-3 bg-surface hover:bg-surface/50 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ta-btn-primary flex-1"
                >
                  {editingClient ? "Update Client" : "Add Client"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}



      {/* SET PASSWORD MODAL */}
      {showPasswordModal && passwordClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-2xl p-8 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-medium text-text-primary mb-1">
                  {passwordClient.portalAccessEnabled ? "Reset" : "Enable"} Portal Access
                </h2>
                <p className="text-sm text-text-muted">
                  {passwordClient.name} • {passwordClient.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordClient(null);
                  setPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                }}
                className="p-2 hover:bg-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted font-medium mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted font-medium mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                  required
                />
              </div>

              {passwordError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{passwordError}</p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  <strong>Login Credentials:</strong>
                </p>
                <p className="text-sm text-blue-700 font-medium">
                  Email: {passwordClient.email}<br />
                  Portal: {window.location.origin}/client-portal/login
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordClient(null);
                    setPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                  className="flex-1 px-6 py-3 bg-surface hover:bg-surface/50 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-900 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  {passwordClient.portalAccessEnabled ? "Reset Password" : "Enable Access"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* SEND LOGIN CREDENTIALS MODAL */}
      {showSendLoginModal && sendLoginClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-2xl p-8 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-medium text-text-primary mb-1">
                  Send Login Credentials
                </h2>
                <p className="text-sm text-text-muted">
                  {sendLoginClient.name} • {sendLoginClient.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSendLoginModal(false);
                  setSendLoginClient(null);
                  setSendLoginError("");
                }}
                className="p-2 hover:bg-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendLoginCredentials} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-blue-800 font-medium mb-3">
                  <strong>📧 Auto-generated credentials will be sent to:</strong>
                </p>
                <p className="text-sm text-blue-700 font-medium font-mono bg-background p-3 rounded border border-blue-200">
                  {sendLoginClient.email}
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl">
                <p className="text-sm text-emerald-800 font-medium mb-2">
                  <strong>✉️ Email will contain:</strong>
                </p>
                <ul className="text-sm text-emerald-700 font-medium space-y-1 list-disc list-inside">
                  <li>Portal login link</li>
                  <li>Email address</li>
                  <li>8-digit numeric password (auto-generated)</li>
                  <li>Security tips</li>
                </ul>
              </div>

              {sendLoginError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{sendLoginError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSendLoginModal(false);
                    setSendLoginClient(null);
                    setSendLoginError("");
                  }}
                  className="flex-1 px-6 py-3 bg-surface hover:bg-surface/50 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingLoginEmail === sendLoginClient._id}
                  className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-900 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-4 h-4" />
                  {sendingLoginEmail === sendLoginClient._id ? "Sending..." : "Send Email"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
