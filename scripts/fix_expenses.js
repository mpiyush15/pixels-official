const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/finance/ExpensesTab.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace dark/light mode hardcoded classes with reusable ta-* classes
const replacements = [
  { search: /<div className="bg-white rounded-xl p-6 border border-gray-200">/g, replace: '<div className="ta-card">' },
  { search: /<div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">/g, replace: '<div className="ta-table-container">' },
  { search: /<table className="w-full">/g, replace: '<table className="w-full text-left border-collapse">' },
  { search: /<thead className="bg-gray-50 border-b border-gray-200">/g, replace: '<thead className="ta-table-header">' },
  { search: /<th className="px-6 py-4 text-left text-sm font-light text-gray-600">/g, replace: '<th className="ta-table-th">' },
  { search: /<td className="px-6 py-4">/g, replace: '<td className="ta-table-td">' },
  { search: /className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"/g, replace: 'className="ta-input w-full pl-12"' },
  { search: /className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"/g, replace: 'className="ta-input"' },
  { search: /text-black/g, replace: 'text-text-primary' },
  { search: /text-gray-600/g, replace: 'text-text-muted' },
  { search: /text-gray-700/g, replace: 'text-text-muted' },
  { search: /text-gray-500/g, replace: 'text-text-muted' },
  { search: /text-gray-400/g, replace: 'text-text-muted' },
  { search: /border-gray-200/g, replace: 'border-border' },
  { search: /border-gray-100/g, replace: 'border-border' },
  { search: /bg-white/g, replace: 'bg-background' },
  { search: /bg-gray-50/g, replace: 'bg-surface' },
  { search: /hover:bg-gray-50/g, replace: 'hover:bg-surface' },
  { search: /hover:bg-gray-100/g, replace: 'hover:bg-surface' },
  { search: /bg-black text-white/g, replace: 'ta-btn-primary' },
];

replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

// Update the typography weight
content = content.replace(/font-light/g, 'font-medium');

// Update tbody for Framer motion and remove loading text block
const tbodyRegex = /<tbody>\s*\{loading \? \([\s\S]*?\) : filteredExpenses\.length === 0 \? \([\s\S]*?\) : \(\s*filteredExpenses\.map\(\(expense\) => \(\s*<tr key=\{expense\._id\}([\s\S]*?)>([\s\S]*?)<\/tr>\s*\)\s*\)\s*\}/;

const newTbody = `<tbody className={\`transition-opacity duration-300 \${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}\`}>
              <AnimatePresence mode="popLayout">
                {filteredExpenses.length === 0 && !loading ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={6} className="ta-table-td text-center py-8 text-text-muted">
                      {searchTerm || filterBusiness !== 'all' || filterCategory !== 'all'
                        ? 'No expenses found matching your filters.'
                        : 'No expenses recorded yet. Click "Add Expense" to get started.'}
                    </td>
                  </motion.tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <motion.tr 
                      key={expense._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      $1>
                      $2
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>`;

content = content.replace(tbodyRegex, newTbody);

if (!content.includes('AnimatePresence')) {
  content = content.replace(/import \{ motion \} from 'framer-motion';/, "import { motion, AnimatePresence } from 'framer-motion';");
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Expenses tab updated successfully!');
