const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/admin/(dashboard)/clients/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Global styling replacements
const replacements = [
  // Page container
  { search: /<div className="p-8">/g, replace: '<div className="p-8 bg-background min-h-[calc(100vh-8rem)] rounded-2xl">' },
  // Texts
  { search: /text-black/g, replace: 'text-text-primary' },
  { search: /text-gray-900/g, replace: 'text-text-primary' },
  { search: /text-gray-800/g, replace: 'text-text-primary' },
  { search: /text-gray-700/g, replace: 'text-text-muted' },
  { search: /text-gray-600/g, replace: 'text-text-muted' },
  { search: /text-gray-500/g, replace: 'text-text-muted' },
  { search: /text-gray-400/g, replace: 'text-text-muted/50' },
  { search: /text-gray-300/g, replace: 'text-text-muted/30' },
  // Cards and backgrounds
  { search: /className="bg-white rounded-xl p-6 border"/g, replace: 'className="ta-card"' },
  { search: /className="bg-white rounded-2xl border border-gray-200 overflow-hidden"/g, replace: 'className="ta-table-container"' },
  { search: /className="text-center bg-white p-10 rounded-2xl border border-gray-200"/g, replace: 'className="ta-card text-center p-10"' },
  { search: /bg-white/g, replace: 'bg-background' },
  { search: /bg-gray-50/g, replace: 'bg-surface' },
  { search: /bg-gray-100/g, replace: 'bg-surface' },
  { search: /bg-gray-200/g, replace: 'bg-surface/50' },
  { search: /border-gray-200/g, replace: 'border-border' },
  { search: /border-gray-100/g, replace: 'border-border' },
  { search: /divide-gray-100/g, replace: 'divide-border' },
  { search: /hover:bg-gray-50\/50/g, replace: 'hover:bg-surface' },
  { search: /hover:bg-gray-100/g, replace: 'hover:bg-surface' },
  { search: /hover:text-gray-900/g, replace: 'hover:text-text-primary' },
  // Modal Cards
  { search: /className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-\[90vh\] overflow-y-auto"/g, replace: 'className="relative bg-background border border-border rounded-xl shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"' },
  { search: /className="bg-white rounded-2xl p-8 max-w-md w-full"/g, replace: 'className="relative bg-background border border-border rounded-xl shadow-xl p-8 max-w-md w-full"' },
  { search: /className="bg-white p-8 rounded-2xl max-w-md w-full relative"/g, replace: 'className="relative bg-background border border-border rounded-xl shadow-xl p-8 max-w-md w-full"' },
  // Inputs
  { search: /className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"/g, replace: 'className="ta-input w-full"' },
  { search: /className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light resize-none"/g, replace: 'className="ta-input w-full resize-none"' },
  // Buttons
  { search: /className="px-6 py-3 bg-black text-white rounded-xl flex items-center gap-2"/g, replace: 'className="ta-btn-primary flex items-center gap-2"' },
  { search: /className="px-6 py-2 bg-black text-white rounded-xl text-sm"/g, replace: 'className="ta-btn-primary"' },
  { search: /className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-900 rounded-xl font-light transition-colors"/g, replace: 'className="ta-btn-primary flex-1"' },
  { search: /className="w-full px-6 py-3 bg-black text-white rounded-xl font-light transition-colors"/g, replace: 'className="ta-btn-primary w-full"' },
  { search: /className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-light transition-colors"/g, replace: 'className="px-6 py-3 border border-border text-text-primary rounded-lg hover:bg-surface transition-colors flex-1"' },
  { search: /className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-light"/g, replace: 'className="px-6 py-3 border border-border text-text-primary rounded-lg hover:bg-surface transition-colors flex-1"' },
  
  // Table headers
  { search: /<tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 font-medium">/g, replace: '<tr className="ta-table-header">' },
  { search: /<th className="px-6 py-4">Client \/ Company<\/th>/g, replace: '<th className="ta-table-th uppercase">Client / Company</th>' },
  { search: /<th className="px-6 py-4">Contact<\/th>/g, replace: '<th className="ta-table-th uppercase">Contact</th>' },
  { search: /<th className="px-6 py-4 text-center">Projects<\/th>/g, replace: '<th className="ta-table-th uppercase text-center">Projects</th>' },
  { search: /<th className="px-6 py-4 text-right">Revenue<\/th>/g, replace: '<th className="ta-table-th uppercase text-right">Revenue</th>' },
  { search: /<th className="px-6 py-4 text-center">Status<\/th>/g, replace: '<th className="ta-table-th uppercase text-center">Status</th>' },
  { search: /<th className="px-6 py-4 text-right">Actions<\/th>/g, replace: '<th className="ta-table-th uppercase text-right">Actions</th>' },
  
  // Table cells
  { search: /<td className="px-6 py-4 align-middle">/g, replace: '<td className="ta-table-td">' },
  { search: /<td className="px-6 py-4 align-middle text-sm text-gray-600">/g, replace: '<td className="ta-table-td text-sm">' },
  { search: /<td className="px-6 py-4 align-middle text-center">/g, replace: '<td className="ta-table-td text-center">' },
  { search: /<td className="px-6 py-4 align-middle text-right font-medium text-gray-900">/g, replace: '<td className="ta-table-td text-right font-medium">' },
  { search: /<td className="px-6 py-4 align-middle text-right">/g, replace: '<td className="ta-table-td text-right">' },
];

replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

// Update the typography weight globally
content = content.replace(/font-light/g, 'font-medium');

// Update Client Status Pill
content = content.replace(/bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600\/20/g, 'bg-emerald-500/10 text-emerald-500');
content = content.replace(/bg-gray-100 text-gray-600 ring-1 ring-gray-500\/20/g, 'bg-surface text-text-muted');

// Update action buttons opacity and colors
content = content.replace(/hover:bg-purple-50/g, 'hover:bg-purple-500/10');
content = content.replace(/hover:bg-indigo-50/g, 'hover:bg-blue-500/10');
content = content.replace(/hover:bg-blue-50/g, 'hover:bg-blue-500/10');
content = content.replace(/hover:bg-red-50/g, 'hover:bg-red-500/10');

// add AnimatePresence import if missing
if (!content.includes('AnimatePresence')) {
  content = content.replace("import { motion } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';");
}

// Replace the tbody with Framer Motion
const tbodyRegex = /<tbody className="divide-y divide-border">([\s\S]*?)<\/tbody>/;
const newTbody = `<tbody className={\`transition-opacity duration-300 \${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}\`}>
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
                            <Mail className="w-3.5 h-3.5 opacity-50" />
                            {client.email}
                          </p>
                          {client.phone && (
                            <p className="flex items-center gap-2 text-text-muted">
                              <Phone className="w-3.5 h-3.5 opacity-50" />
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
                          className={\`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase \${
                            client.status === "active"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-surface text-text-muted"
                          }\`}
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
                            className={\`p-1.5 rounded-lg transition-colors \${
                              client.portalAccessEnabled
                                ? 'text-purple-500 hover:bg-purple-500/10'
                                : 'text-text-muted/50 hover:text-blue-500 hover:bg-blue-500/10'
                            }\`}
                            title={client.portalAccessEnabled ? 'Reset Portal Password' : 'Enable Portal Access'}
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openSendLoginModal(client)}
                            disabled={!client.email || sendingLoginEmail === client._id}
                            className="p-1.5 rounded-lg text-text-muted/50 hover:text-blue-500 hover:bg-blue-500/10 disabled:opacity-50 transition-colors"
                            title="Send Login Credentials"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <div className="w-px h-4 bg-surface/50 mx-1" />
                          <button
                            onClick={() => handleEdit(client)}
                            className="p-1.5 rounded-lg text-text-muted/50 hover:text-text-primary hover:bg-surface transition-colors"
                            title="Edit Client"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(client._id)}
                            className="p-1.5 rounded-lg text-text-muted/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="pl-2 ml-1 border-l border-border">
                            <ChevronRight className="w-5 h-5 text-text-muted/30 group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>`;
content = content.replace(tbodyRegex, newTbody);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Clients page updated successfully!');
