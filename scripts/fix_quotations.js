const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/admin/(dashboard)/quotations/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Add AnimatePresence import if missing
if (!content.includes('AnimatePresence')) {
  content = content.replace("import { motion } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';");
}

// 1. Table Wrapper
const oldWrapper = /<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">/g;
const newWrapper = '<div className="ta-table-container">';
content = content.replace(oldWrapper, newWrapper);

// 2. Table Header
const oldThead = /<tr className="bg-gray-50 border-b border-gray-200">/g;
const newThead = '<tr className="ta-table-header">';
content = content.replace(oldThead, newThead);

// 3. Table Headers
content = content.replace(/<th className="px-6 py-4 text-left text-sm font-bold text-gray-900 /g, '<th className="ta-table-th ');
content = content.replace(/<th className="px-6 py-4 text-right text-sm font-bold text-gray-900">/g, '<th className="ta-table-th text-right">');

// 4. Table Body row motion logic
// We want to wrap tbody contents in AnimatePresence
const tbodyRegex = /<tbody>\s*\{filteredQuotations\.map\(\(quotation, index\) => \(\s*<motion\.tr\s*key=\{quotation\._id\}\s*initial=\{\{ opacity: 0 \}\}\s*animate=\{\{ opacity: 1 \}\}\s*className=\{`border-b border-gray-100 hover:bg-gray-50 transition-colors \$\{\s*index % 2 === 0 \? 'bg-white' : 'bg-gray-50\/50'\s*\}\`\}\s*>/s;

const newTbody = `<tbody>
              <AnimatePresence mode="popLayout">
              {filteredQuotations.map((quotation, index) => (
                <motion.tr
                  key={quotation._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ta-table-row"
                >`;

if (content.match(tbodyRegex)) {
  content = content.replace(tbodyRegex, newTbody);
  // Also need to close AnimatePresence at the end of the map
  content = content.replace(/<\/motion\.tr>\s*\)\)\}\s*<\/tbody>/g, `</motion.tr>\n              ))}\n              </AnimatePresence>\n            </tbody>`);
}

// 5. Table cells
content = content.replace(/<td className="px-6 py-4/g, '<td className="ta-table-td');

// 6. Text color fixes inside table
content = content.replace(/text-gray-900/g, 'text-text-primary');
content = content.replace(/text-gray-500/g, 'text-text-muted');
content = content.replace(/text-gray-400/g, 'text-text-muted');
content = content.replace(/text-gray-600/g, 'text-text-muted');
content = content.replace(/text-black/g, 'text-text-primary');

// Search and Filter boxes
content = content.replace(/bg-white\/5 border border-white\/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white\/20/g, 'ta-input');
content = content.replace(/text-white/g, 'text-text-primary');

// Modals:
content = content.replace(/bg-gray-900 rounded-lg/g, 'ta-modal-content');
content = content.replace(/bg-black\/50 flex items-center justify-center/g, 'ta-modal-overlay flex items-center justify-center');
content = content.replace(/bg-white text-black hover:bg-gray-100/g, 'ta-btn-primary');

// Revert specific texts where bg-white was replaced
content = content.replace(/bg-white\/5/g, 'bg-surface/30');

// Fix text-white inside action buttons that we missed or need to keep? Actually replacing all text-white is bad if button is primary.
// The new ta-btn-primary has text-white. We replaced all text-white with text-text-primary.
// Let's revert ta-btn-primary text-text-primary
content = content.replace(/ta-btn-primary rounded-lg hover:bg-gray-100 transition-colors font-medium/g, 'ta-btn-primary');

// Badges
content = content.replace(/bg-amber-50 text-amber-700 border-amber-200/g, 'bg-warning/10 text-warning border-warning/20');
content = content.replace(/bg-green-50 text-green-700 border-green-200/g, 'bg-success/10 text-success border-success/20');
content = content.replace(/bg-red-50 text-red-700 border-red-200/g, 'bg-danger/10 text-danger border-danger/20');
content = content.replace(/bg-gray-100 text-gray-700 border-gray-300/g, 'bg-surface text-text-muted border-border');

// Action buttons in table
content = content.replace(/text-purple-600 hover:bg-purple-50/g, 'text-text-muted hover:text-purple-500 hover:bg-purple-500/10');
content = content.replace(/text-green-600 hover:bg-green-50/g, 'text-text-muted hover:text-green-500 hover:bg-green-500/10');
content = content.replace(/text-blue-600 hover:bg-blue-50/g, 'text-text-muted hover:text-blue-500 hover:bg-blue-500/10');
content = content.replace(/text-red-600 hover:bg-red-50/g, 'text-text-muted hover:text-red-500 hover:bg-red-500/10');

// New Quotation button
content = content.replace(/<motion\.button\s*onClick=\{\(\) => setShowCreateModal\(true\)\}\s*whileHover=\{\{ scale: 1\.02 \}\}\s*whileTap=\{\{ scale: 0\.98 \}\}\s*className="flex items-center gap-2 px-6 py-3 bg-white text-text-primary rounded-lg hover:bg-gray-100 transition-colors"\s*>/g, 
  '<motion.button\n          onClick={() => setShowCreateModal(true)}\n          whileHover={{ scale: 1.02 }}\n          whileTap={{ scale: 0.98 }}\n          className="ta-btn-primary flex items-center gap-2"\n        >');

// Select status in table
content = content.replace(/border-gray-300 rounded-lg text-text-primary bg-white hover:bg-gray-50 focus:ring-blue-500/g, 'border-border rounded-lg text-text-primary bg-surface hover:opacity-80 focus:ring-primary');

// View Modal empty states
content = content.replace(/bg-gray-50/g, 'bg-surface');
content = content.replace(/text-gray-300/g, 'text-text-muted');

// Labels and Inputs inside Modal
content = content.replace(/text-text-muted mb-2/g, 'text-text-primary mb-2');

// Status Dropdown
content = content.replace(/className="ml-1 px-3 py-1\.5 text-xs font-semibold border border-border rounded-lg text-text-primary bg-surface hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer transition-colors"/g, 
'className="ml-1 px-3 py-1.5 text-xs font-semibold border border-border rounded-lg text-text-primary bg-surface hover:opacity-80 cursor-pointer transition-colors outline-none"');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Quotations page updated successfully!');
