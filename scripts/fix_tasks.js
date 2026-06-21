const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/admin/(dashboard)/tasks/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replacements
const replacements = [
  // Wrappers and cards
  { search: /<div className="p-6">/g, replace: '<div className="p-8 bg-background min-h-[calc(100vh-8rem)] rounded-2xl">' },
  { search: /<div className="bg-white rounded-lg shadow-sm p-4">/g, replace: '<div className="ta-card">' },
  { search: /<div className="bg-white rounded-lg shadow-sm p-4 mb-6">/g, replace: '<div className="ta-card mb-6">' },
  { search: /<div className="bg-white rounded-lg shadow-sm overflow-hidden">/g, replace: '<div className="ta-table-container">' },
  // Headers and texts
  { search: /text-gray-900/g, replace: 'text-text-primary' },
  { search: /text-gray-700/g, replace: 'text-text-primary' },
  { search: /text-gray-600/g, replace: 'text-text-muted' },
  { search: /text-gray-500/g, replace: 'text-text-muted' },
  { search: /text-gray-400/g, replace: 'text-text-muted' },
  { search: /text-gray-300/g, replace: 'text-text-muted' },
  { search: /border-gray-300/g, replace: 'border-border' },
  { search: /border-gray-200/g, replace: 'border-border' },
  { search: /bg-white/g, replace: 'bg-background' },
  { search: /bg-gray-50/g, replace: 'bg-surface' },
  { search: /hover:bg-gray-50/g, replace: 'hover:bg-surface' },
  { search: /bg-gradient-to-r from-purple-600 to-indigo-600/g, replace: 'bg-primary' },
  { search: /text-white/g, replace: 'text-background' },
  { search: /focus:ring-purple-500/g, replace: 'focus:border-primary' },
  // Inputs
  { search: /className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"/g, replace: 'className="ta-input w-full pl-10"' },
  { search: /className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"/g, replace: 'className="ta-input"' },
  { search: /className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"/g, replace: 'className="ta-input"' },
  { search: /className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"/g, replace: 'className="ta-input"' },
  // Table 
  { search: /<table className="min-w-full divide-y divide-gray-200">/g, replace: '<table className="w-full text-left border-collapse">' },
  { search: /<thead className="bg-gray-50">/g, replace: '<thead className="ta-table-header">' },
  { search: /<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">/g, replace: '<th className="ta-table-th uppercase">' },
  { search: /<td className="px-6 py-4">/g, replace: '<td className="ta-table-td">' },
  { search: /<td className="px-6 py-4 text-sm text-gray-900">/g, replace: '<td className="ta-table-td text-sm font-medium text-text-primary">' },
];

replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

// Update the typography weight
content = content.replace(/font-bold/g, 'font-medium');

// Remove early loading block
const earlyLoadingBlock = `
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-text-muted">Loading tasks...</div>
      </div>
    );
  }
`;
content = content.replace(earlyLoadingBlock, '');
content = content.replace(/if \(loading\) \{\s*return \(\s*<div className="flex items-center justify-center h-64">\s*<div className="text-xl text-text-muted">Loading tasks...<\/div>\s*<\/div>\s*\);\s*\}/, '');

// Fix getStatusColor and getPriorityColor functions
const statusColorBlock = `  const getStatusColor = (status: string) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      submitted: 'bg-purple-100 text-purple-700',
      approved: 'bg-emerald-100 text-emerald-700',
      'revision-needed': 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-surface text-text-muted';
  };`;

const newStatusColorBlock = `  const getStatusColor = (status: string) => {
    const colors = {
      assigned: 'bg-blue-500/10 text-blue-500',
      'in-progress': 'bg-orange-500/10 text-orange-500',
      completed: 'bg-emerald-500/10 text-emerald-500',
      submitted: 'bg-purple-500/10 text-purple-500',
      approved: 'bg-emerald-500/10 text-emerald-500',
      'revision-needed': 'bg-red-500/10 text-red-500',
    };
    return colors[status as keyof typeof colors] || 'bg-surface text-text-muted';
  };`;
content = content.replace(statusColorBlock, newStatusColorBlock);

const priorityColorBlock = `  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-surface text-text-muted',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    };
    return colors[priority as keyof typeof colors] || 'bg-surface text-text-muted';
  };`;
const newPriorityColorBlock = `  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-surface text-text-muted',
      medium: 'bg-blue-500/10 text-blue-500',
      high: 'bg-orange-500/10 text-orange-500',
      urgent: 'bg-red-500/10 text-red-500',
    };
    return colors[priority as keyof typeof colors] || 'bg-surface text-text-muted';
  };`;
content = content.replace(priorityColorBlock, newPriorityColorBlock);

// Replace tbody with framer motion
const tbodyRegex = /<tbody className="bg-background divide-y divide-border">([\s\S]*?)<\/tbody>/;
const newTbody = `<tbody className={\`transition-opacity duration-300 \${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}\`}>
              <AnimatePresence mode="popLayout">
                {filteredTasks.length === 0 && !loading ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={7} className="ta-table-td text-center py-8 text-text-muted">
                      No tasks found. Create a new task to get started.
                    </td>
                  </motion.tr>
                ) : (
                  filteredTasks.map((task) => (
                    <motion.tr 
                      key={task._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border-b border-border hover:bg-surface"
                    >
                      <td className="ta-table-td">
                        <div>
                          <div className="font-medium text-text-primary">{task.title}</div>
                          <div className="text-sm text-text-muted line-clamp-1">{task.description}</div>
                        </div>
                      </td>
                      <td className="ta-table-td">
                        <div className="text-sm text-text-primary">{task.clientName}</div>
                        {task.projectName && (
                          <div className="text-sm text-text-muted">{task.projectName}</div>
                        )}
                      </td>
                      <td className="ta-table-td">
                        <div className="text-sm text-text-primary">{task.assignedToName}</div>
                        <div className="text-sm text-text-muted capitalize">
                          {task.assignedToRole.replace('-', ' ')}
                        </div>
                      </td>
                      <td className="ta-table-td">
                        <span className={\`px-3 py-1 rounded-full text-xs font-medium inline-block \${getStatusColor(task.status)}\`}>
                          {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="ta-table-td">
                        <span className={\`px-3 py-1 rounded-full text-xs font-medium inline-block \${getPriorityColor(task.priority)}\`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="ta-table-td text-sm font-medium text-text-primary">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td className="ta-table-td">
                        <div className="flex items-center space-x-2">
                          <a
                            href={\`/admin/tasks/\${task._id}\`}
                            className="text-text-muted hover:text-text-primary font-medium text-sm transition-colors"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>`;
content = content.replace(tbodyRegex, newTbody);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Tasks tab updated successfully!');
