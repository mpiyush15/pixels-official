const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/admin/(dashboard)/clients/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Global styling replacements
const replacements = [
  // Typography
  { search: /text-black/g, replace: 'text-text-primary' },
  { search: /text-gray-900/g, replace: 'text-text-primary' },
  { search: /text-gray-800/g, replace: 'text-text-primary' },
  { search: /text-gray-700/g, replace: 'text-text-muted' },
  { search: /text-gray-600/g, replace: 'text-text-muted' },
  { search: /text-gray-500/g, replace: 'text-text-muted' },
  { search: /text-gray-400/g, replace: 'text-text-muted/50' },
  { search: /text-gray-300/g, replace: 'text-text-muted/30' },
  // Cards and backgrounds
  { search: /className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"/g, replace: 'className="ta-card"' },
  { search: /className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"/g, replace: 'className="ta-table-container"' },
  { search: /bg-white/g, replace: 'bg-background' },
  { search: /bg-gray-50/g, replace: 'bg-surface' },
  { search: /bg-gray-100/g, replace: 'bg-surface' },
  { search: /bg-gray-200/g, replace: 'bg-surface/50' },
  { search: /border-gray-200/g, replace: 'border-border' },
  { search: /border-gray-100/g, replace: 'border-border' },
  { search: /divide-gray-100/g, replace: 'divide-border' },
  { search: /hover:bg-gray-50/g, replace: 'hover:bg-surface' },
  { search: /hover:bg-gray-100/g, replace: 'hover:bg-surface' },
  { search: /hover:text-gray-900/g, replace: 'hover:text-text-primary' },
  
  // Table headers
  { search: /<thead className="bg-surface border-b border-border text-sm text-text-muted">/g, replace: '<thead className="ta-table-header">' },
  { search: /<th className="px-6 py-4 font-medium">/g, replace: '<th className="ta-table-th uppercase">' },
  { search: /<th className="px-6 py-4 font-medium text-right">/g, replace: '<th className="ta-table-th uppercase text-right">' },
  
  // Table cells
  { search: /<td className="px-6 py-4 font-medium text-text-primary">/g, replace: '<td className="ta-table-td font-medium text-text-primary">' },
  { search: /<td className="px-6 py-4">/g, replace: '<td className="ta-table-td">' },
  { search: /<td className="px-6 py-4 text-sm text-text-muted">/g, replace: '<td className="ta-table-td text-sm text-text-muted">' },
  { search: /<td className="px-6 py-4 text-right font-medium text-text-primary">/g, replace: '<td className="ta-table-td text-right font-medium text-text-primary">' },
  { search: /<td className="px-6 py-4 text-right">/g, replace: '<td className="ta-table-td text-right">' },
  { search: /<td className="px-6 py-4 text-right text-emerald-600 font-medium">/g, replace: '<td className="ta-table-td text-right text-emerald-500 font-medium">' },
  { search: /<td className="px-6 py-4 text-right font-semibold text-emerald-600">/g, replace: '<td className="ta-table-td text-right font-semibold text-emerald-500">' },
];

replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

// Update the typography weight globally
content = content.replace(/font-light/g, 'font-medium');

// Update Status Pills
content = content.replace(/bg-emerald-50 text-emerald-700/g, 'bg-emerald-500/10 text-emerald-500');
content = content.replace(/bg-indigo-50 text-indigo-700/g, 'bg-indigo-500/10 text-indigo-500');
content = content.replace(/bg-orange-50 text-orange-700/g, 'bg-orange-500/10 text-orange-500');
content = content.replace(/bg-surface text-text-muted/g, 'bg-surface text-text-muted'); // Wait, already replaced bg-gray-100 text-gray-700, so it's bg-surface text-text-primary. Need to fix it.
content = content.replace(/bg-surface text-text-primary/g, 'bg-surface text-text-muted');

// Invoices Pill Fix
const invoicesPillSearch = /\?\s*'bg-emerald-50 text-emerald-700'\s*:\s*inv.status\s*===\s*'partially_paid'\s*\?\s*'bg-orange-50 text-orange-700'\s*:\s*'bg-gray-100 text-gray-700'/g;
content = content.replace(invoicesPillSearch, "? 'bg-emerald-500/10 text-emerald-500' : inv.status === 'partially_paid' ? 'bg-orange-500/10 text-orange-500' : 'bg-surface text-text-muted'");

// Tab active states line 196
content = content.replace(/className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"/g, 'className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary"');
content = content.replace(/activeTab === tab.id \? 'text-text-primary' : 'text-text-muted hover:text-text-primary'/g, "activeTab === tab.id ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'");

// Progress bar
content = content.replace(/<div className="bg-black h-1.5 rounded-full"/g, '<div className="bg-primary h-1.5 rounded-full"');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Client Details page updated successfully!');
