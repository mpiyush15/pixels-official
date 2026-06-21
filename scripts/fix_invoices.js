const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/finance/InvoicesTab.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace dark/light mode hardcoded classes
const replacements = [
  { search: /bg-white/g, replace: 'bg-background' },
  { search: /bg-gray-50/g, replace: 'bg-surface' },
  { search: /hover:bg-gray-50/g, replace: 'hover:bg-surface' },
  { search: /text-gray-900/g, replace: 'text-text-primary' },
  { search: /text-black/g, replace: 'text-text-primary' },
  { search: /text-gray-500/g, replace: 'text-text-muted' },
  { search: /text-gray-600/g, replace: 'text-text-muted' },
  { search: /text-gray-400/g, replace: 'text-text-muted' },
  { search: /border-gray-100/g, replace: 'border-border' },
  { search: /border-gray-200/g, replace: 'border-border' },
  { search: /border-gray-300/g, replace: 'border-border' },
  { search: /border-black/g, replace: 'border-primary' },
];

replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

// Now replace the tbody to add Framer Motion and remove the loading check
const tbodyRegex = /<tbody>\s*\{loading \? \([\s\S]*?\) : invoices\.length === 0 \? \([\s\S]*?\) : \(\s*invoices\.map\(\(invoice\) => \(\s*<tr key=\{invoice\._id\}([\s\S]*?)>([\s\S]*?)<\/tr>\s*\)\s*\)\s*\}/;

// Just run a simple string replacement for the exact lines that define the loading block
// Wait, we can just replace the whole loading block manually if regex is too risky.
// Let's do a more robust string replace

const newTbody = `<tbody className={\`transition-opacity duration-300 \${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}\`}>
              <AnimatePresence mode="popLayout">
                {invoices.length === 0 && !loading ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={7} className="px-6 py-8 text-center text-text-muted font-light">
                      No invoices yet. Create your first invoice to get started.
                    </td>
                  </motion.tr>
                ) : (
                  invoices.map((invoice) => (
                    <motion.tr 
                      key={invoice._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border-b border-border hover:bg-surface"
                    >
                      <td className="px-6 py-4">
                        <p className="font-light text-text-primary">{invoice.invoiceNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-light text-text-primary">{invoice.clientName}</p>
                        {invoice.projectName && (
                          <p className="text-xs text-indigo-600 font-light mt-1">Project: {invoice.projectName}</p>
                        )}
                        <p className="text-sm text-text-muted font-light">{invoice.clientEmail}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-light text-text-primary">₹{invoice.total.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={\`px-3 py-1 rounded-full text-sm font-light \${getStatusColor(invoice.status)}\`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-light text-text-muted">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-light text-text-muted">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowViewModal(true);
                            }}
                            className="p-2 hover:bg-surface rounded-lg transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4 text-text-muted" />
                          </button>
                          {invoice.status === 'draft' && (
                            <button
                              onClick={() => {
                                if (confirm(\`Send invoice \${invoice.invoiceNumber} to client?\`)) {
                                  updateInvoiceStatus(invoice._id, 'sent');
                                }
                              }}
                              className="px-3 py-1 bg-blue-600 text-background text-xs rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Send
                            </button>
                          )}
                          {invoice.status === 'sent' && (
                            <button
                              onClick={() => {
                                if (confirm(\`Mark invoice \${invoice.invoiceNumber} as paid?\`)) {
                                  updateInvoiceStatus(invoice._id, 'paid');
                                }
                              }}
                              className="px-3 py-1 bg-emerald-600 text-background text-xs rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>`;

const regexToReplace = /<tbody>[\s\S]*?<\/tbody>/;
content = content.replace(regexToReplace, newTbody);

if (!content.includes('AnimatePresence')) {
  content = content.replace(/import \{ motion \} from 'framer-motion';/, "import { motion, AnimatePresence } from 'framer-motion';");
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Invoices tab updated successfully!');
