const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/admin/(dashboard)/schedule/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Global styling replacements
const replacements = [
  // Page container
  { search: /<div className="p-6">/g, replace: '<div className="p-8 bg-background min-h-[calc(100vh-8rem)] rounded-2xl">' },
  // Texts
  { search: /text-gray-900/g, replace: 'text-text-primary' },
  { search: /text-gray-700/g, replace: 'text-text-primary' },
  { search: /text-gray-600/g, replace: 'text-text-muted' },
  { search: /text-gray-500/g, replace: 'text-text-muted' },
  { search: /text-gray-400/g, replace: 'text-text-muted' },
  // Backgrounds & borders
  { search: /bg-white/g, replace: 'bg-background' },
  { search: /bg-gray-50/g, replace: 'bg-surface' },
  { search: /bg-gray-100/g, replace: 'bg-surface hover:bg-surface/80' },
  { search: /border-gray-100/g, replace: 'border-border' },
  { search: /border-gray-200/g, replace: 'border-border' },
  { search: /border-gray-300/g, replace: 'border-border' },
  // Buttons & inputs
  { search: /className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/g, replace: 'className="ta-input w-full"' },
  { search: /className="text-xs border border-gray-300 rounded px-2 py-1"/g, replace: 'className="ta-input text-xs px-2 py-1 h-auto"' },
  { search: /bg-gradient-to-r from-blue-600 to-purple-600/g, replace: 'bg-primary' },
  { search: /text-white/g, replace: 'text-background' },
];

replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

// Update the typography weight
content = content.replace(/font-bold/g, 'font-medium');

// Cards
content = content.replace(/className="bg-background rounded-xl shadow-sm border border-border p-6"/g, 'className="ta-card"');
content = content.replace(/className="bg-background rounded-xl shadow-sm border border-border p-4"/g, 'className="ta-card"');

// Fix calendar sizes and colors
content = content.replace(/min-h-\[100px\]/g, 'min-h-[80px]'); // make it smaller to view

content = content.replace(/bg-blue-50/g, 'bg-primary/10');
content = content.replace(/text-blue-600/g, 'text-primary');
content = content.replace(/border-blue-300/g, 'border-primary/30');
content = content.replace(/ring-blue-200/g, 'ring-primary/20');
content = content.replace(/bg-purple-50/g, 'bg-purple-500/10');
content = content.replace(/border-purple-300/g, 'border-purple-500/30');

// Event pills in calendar
content = content.replace(/bg-red-100 text-red-700/g, 'bg-red-500/10 text-red-500');
content = content.replace(/bg-green-100 text-green-700/g, 'bg-emerald-500/10 text-emerald-500');
content = content.replace(/bg-gray-100 text-text-muted/g, 'bg-surface text-text-muted'); // wait, the previous global replace changed bg-gray-100 to bg-surface hover:bg-surface/80
content = content.replace(/bg-blue-100 text-blue-700/g, 'bg-blue-500/10 text-blue-500');
// The script might not catch bg-gray-100 text-gray-500 because of earlier replacements
content = content.replace(/bg-surface hover:bg-surface\/80 text-text-muted/g, 'bg-surface text-text-muted');

// Sidebar tasks (Deadlines)
content = content.replace(/className="p-2 bg-red-50 rounded-lg border border-red-200"/g, 'className="p-3 bg-red-500/5 rounded-lg border border-red-500/20"');
content = content.replace(/text-red-600/g, 'text-red-500');

// Fix modal close button
content = content.replace(/className="p-2 hover:bg-surface hover:bg-surface\/80 rounded-lg"/g, 'className="p-2 hover:bg-surface rounded-lg text-text-muted"');

// Add specific styles to the calendar container
content = content.replace(/className="grid grid-cols-1 lg:grid-cols-3 gap-6"/g, 'className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6"');
content = content.replace(/className="lg:col-span-2"/g, 'className="lg:col-span-2 xl:col-span-3"'); // This makes the calendar take up 3/4 and sidebar 1/4 on xl screens

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Schedule page updated successfully!');
