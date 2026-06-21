const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/admin/(dashboard)/leads/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Global styling replacements
const replacements = [
  // Page container
  { search: /<div className="p-8">/g, replace: '<div className="p-8 bg-background min-h-[calc(100vh-8rem)] rounded-2xl">' },
  // Texts
  { search: /text-black/g, replace: 'text-text-primary' },
  { search: /text-gray-600/g, replace: 'text-text-muted' },
  { search: /text-gray-500/g, replace: 'text-text-muted' },
  { search: /text-gray-700/g, replace: 'text-text-primary' },
  // Cards
  { search: /className="bg-white rounded-xl p-4 border border-gray-200"/g, replace: 'className="ta-card"' },
  { search: /className="bg-white rounded-2xl border border-gray-200 overflow-hidden"/g, replace: 'className="ta-table-container"' },
  // Backgrounds
  { search: /bg-white/g, replace: 'bg-background' },
  { search: /bg-gray-50/g, replace: 'bg-surface' },
  { search: /hover:bg-gray-50/g, replace: 'hover:bg-surface' },
  { search: /hover:bg-gray-100/g, replace: 'hover:bg-surface' },
  { search: /border-gray-100/g, replace: 'border-border' },
  { search: /border-gray-200/g, replace: 'border-border' },
];

replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

// Update the typography weight
content = content.replace(/font-light/g, 'font-medium');

// Table header
content = content.replace(/<thead className="bg-surface border-b border-border">/g, '<thead className="ta-table-header">');
content = content.replace(/<th className="px-6 py-4 text-left text-sm font-medium text-text-muted">/g, '<th className="ta-table-th uppercase">');

// Table cells
content = content.replace(/<td className="px-6 py-4">/g, '<td className="ta-table-td">');

// Fix getStatusColor function
const statusColorBlock = `  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'contacted': return 'bg-yellow-100 text-yellow-700';
      case 'converted': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-surface hover:bg-surface/80 text-text-primary';
      default: return 'bg-surface hover:bg-surface/80 text-text-primary';
    }
  };`;
const newStatusColorBlock = `  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-500';
      case 'contacted': return 'bg-orange-500/10 text-orange-500';
      case 'converted': return 'bg-emerald-500/10 text-emerald-500';
      case 'closed': return 'bg-surface text-text-muted';
      default: return 'bg-surface text-text-muted';
    }
  };`;
content = content.replace(statusColorBlock, newStatusColorBlock);

// Original getStatusColor might have different spacing or characters depending on earlier replacements
content = content.replace(/case 'new': return 'bg-blue-100 text-blue-700';/g, "case 'new': return 'bg-blue-500/10 text-blue-500';");
content = content.replace(/case 'contacted': return 'bg-yellow-100 text-yellow-700';/g, "case 'contacted': return 'bg-orange-500/10 text-orange-500';");
content = content.replace(/case 'converted': return 'bg-green-100 text-green-700';/g, "case 'converted': return 'bg-emerald-500/10 text-emerald-500';");
content = content.replace(/case 'closed': return 'bg-surface text-text-primary';/g, "case 'closed': return 'bg-surface text-text-muted';");
content = content.replace(/default: return 'bg-surface text-text-primary';/g, "default: return 'bg-surface text-text-muted';");


// Replace select field in the table
const selectSearch = /className={\`px-3 py-1 rounded-full text-sm font-medium \${getStatusColor\(lead\.status\)}\`}/g;
const selectReplace = 'className={`ta-input !py-1 !px-3 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}';
content = content.replace(selectSearch, selectReplace);


// Modal buttons
content = content.replace(/className="flex-1 bg-green-600 hover:bg-green-700 text-background px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"/g, 'className="ta-btn-primary flex-1 flex items-center justify-center gap-2"');
content = content.replace(/className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4"/g, 'className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"');
content = content.replace(/className="text-green-700 font-medium text-center"/g, 'className="text-emerald-500 font-medium text-center"');


// Table body and framer motion
const tbodyRegex = /<tbody>([\s\S]*?)<\/tbody>/;
const newTbody = `<tbody className={\`transition-opacity duration-300 \${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}\`}>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={6} className="px-6 py-8 text-center text-text-muted font-medium">
                      Loading leads...
                    </td>
                  </motion.tr>
                ) : leads.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={6} className="px-6 py-8 text-center text-text-muted font-medium">
                      No leads yet
                    </td>
                  </motion.tr>
                ) : (
                  leads.map((lead) => (
                    <motion.tr 
                      key={lead._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border-b border-border hover:bg-surface"
                    >
                      <td className="ta-table-td">
                        <p className="font-medium text-text-primary">{lead.name}</p>
                      </td>
                      <td className="ta-table-td">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-text-muted flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </p>
                          {lead.phone && (
                            <p className="text-sm font-medium text-text-muted flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {lead.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="ta-table-td">
                        <span className="text-sm font-medium text-text-muted">{lead.source}</span>
                      </td>
                      <td className="ta-table-td">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                          className={\`ta-input !py-1 !px-3 rounded-full text-sm font-medium \${getStatusColor(lead.status)}\`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="ta-table-td">
                        <span className="text-sm font-medium text-text-muted flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="ta-table-td">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-2 hover:bg-surface rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-text-muted" />
                          </button>
                          {lead.status !== 'converted' && (
                            <button
                              onClick={() => convertToClient(lead._id)}
                              className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Convert to Client"
                            >
                              <UserPlus className="w-4 h-4 text-emerald-500" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteLead(lead._id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>`;
content = content.replace(tbodyRegex, newTbody);

// add AnimatePresence import if missing
if (!content.includes('AnimatePresence')) {
  content = content.replace("import { motion } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';");
}

// Ensure the outer modal div is dark mode themed correctly
content = content.replace(/className="bg-background rounded-2xl p-8 max-w-2xl w-full"/g, 'className="ta-card max-w-2xl w-full p-8"');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Leads page updated successfully!');
