'use client';

import { motion } from 'framer-motion';
import { IndianRupee, Users, FolderKanban, UserCog, ExternalLink, Calendar, Receipt, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ZohoAppLauncher() {
  const departments = [
    {
      id: 'finance',
      title: 'Accounts & Finance',
      description: 'Working Capital, Payables, Receivables, Cashflow & Revenue',
      icon: IndianRupee,
      color: 'emerald',
      path: '/admin/finance',
      quickLinks: ['Invoices', 'Expenses', 'Working Capital']
    },
    {
      id: 'operations',
      title: 'Projects & Operations',
      description: 'Active Projects, Task Management, Schedules & Submissions',
      icon: FolderKanban,
      color: 'indigo',
      path: '/admin/operations',
      quickLinks: ['Active Projects', 'Task Board', 'Schedule']
    },
    {
      id: 'crm',
      title: 'CRM & Sales',
      description: 'Lead Pipeline, Client Directory, Quotations & Project Chats',
      icon: Users,
      color: 'blue',
      path: '/admin/crm',
      quickLinks: ['Leads', 'Clients', 'Quotations']
    },
    {
      id: 'team',
      title: 'HR & Team Hub',
      description: 'Staff Management, Salaries, Payments & Daily Content',
      icon: UserCog,
      color: 'amber',
      path: '/admin/team',
      quickLinks: ['Staff Directory', 'Payments', 'Content']
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen pb-24">
      
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Pixels Central Command</h1>
        <p className="text-gray-500 font-medium text-lg">Select a department to access your workspace</p>
      </div>

      {/* App Launcher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {departments.map((dept, idx) => {
          const Icon = dept.icon;
          
          return (
            <motion.div 
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link 
                href={dept.path} 
                className={`block bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-${dept.color}-500 transition-all duration-300 group relative overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 w-48 h-48 bg-${dept.color}-50 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-125 duration-500`} />
                
                <div className="relative z-10 flex items-start gap-6">
                  <div className={`p-4 bg-${dept.color}-50 text-${dept.color}-600 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={40} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{dept.title}</h2>
                    <p className="text-gray-500 leading-relaxed mb-6">{dept.description}</p>
                    
                    <div className="flex gap-3 text-sm">
                      {dept.quickLinks.map(link => (
                        <span key={link} className={`px-3 py-1 bg-gray-50 text-gray-600 rounded-lg border border-gray-100 group-hover:border-${dept.color}-100 transition-colors`}>
                          {link}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* External Tools */}
      <div className="mt-16 text-center">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-6">External Portals</p>
        <div className="flex justify-center gap-6">
          <a href="/client-portal/login" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors font-medium">
            <ExternalLink size={18} />
            Client Portal Access
          </a>
        </div>
      </div>

    </div>
  );
}
