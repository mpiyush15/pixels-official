'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Wallet, 
  UserCog, 
  LogOut,
  ChevronDown,
  PieChart,
  FileText,
  Receipt,
  Mail,
  CheckSquare,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  icon: any;
  label: string;
  path?: string;
  children?: { label: string; path: string }[];
}

const menuGroups: MenuGroup[] = [
  {
    title: 'MENU',
    items: [
      {
        icon: LayoutDashboard,
        label: 'Dashboard',
        children: [
          { label: 'Central Hub', path: '/admin/dashboard' },
          { label: 'Finance Hub', path: '/admin/finance' },
          { label: 'System Guide', path: '/admin/guide' },
        ]
      },
      {
        icon: Wallet,
        label: 'Finance',
        children: [
          { label: 'Chart of Accounts', path: '/admin/finance/accounts' },
          { label: 'Financial Reports', path: '/admin/finance/reports' },
          { label: 'Profit & Loss (Old)', path: '/admin/profit-loss' },
          { label: 'Master Ledger', path: '/admin/ledger' },
          { label: 'Invoices', path: '/admin/invoices' },
          { label: 'Expenses', path: '/admin/expenses' },
        ]
      },
      {
        icon: FolderKanban,
        label: 'Operations',
        children: [
          { label: 'Active Projects', path: '/admin/projects' },
          { label: 'Task Management', path: '/admin/tasks' },
          { label: 'Calendar', path: '/admin/schedule' },
        ]
      },
      {
        icon: Users,
        label: 'CRM',
        children: [
          { label: 'Leads Pipeline', path: '/admin/leads' },
          { label: 'Client Directory', path: '/admin/clients' },
          { label: 'Quotations', path: '/admin/quotations' },
        ]
      },
      {
        icon: UserCog,
        label: 'Team',
        children: [
          { label: 'Staff Management', path: '/admin/staff' },
          { label: 'Daily Content', path: '/admin/daily-content' },
        ]
      }
    ]
  }
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (arg: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [expandedItems, setExpandedItems] = useState<string[]>(['Dashboard']);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      router.push('/admin/login');
    }
  };

  return (
    <aside
      className={`absolute left-0 top-0 z-50 flex h-screen w-72.5 flex-col overflow-y-hidden bg-sidebar border-r border-border duration-300 ease-linear lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ width: '290px' }}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 pt-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/admin/dashboard')}>
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-wide">Pixels OS</h1>
            <p className="text-xs text-text-muted font-medium tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="block lg:hidden text-text-muted hover:text-text-primary transition-colors"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.5875 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* SIDEBAR HEADER END */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              <h3 className="mb-4 ml-4 text-sm font-bold text-text-muted uppercase tracking-widest">
                {group.title}
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  const isExpanded = expandedItems.includes(item.label);
                  const isActive = item.path === pathname || (item.children && item.children.some(c => c.path === pathname));

                  return (
                    <li key={index}>
                      {item.path && !item.children ? (
                        <Link
                          href={item.path}
                          className={`group relative flex w-full items-center gap-2.5 rounded-xl px-4 py-3 font-medium duration-300 ease-in-out hover:bg-surface hover:text-text-primary ${
                            isActive 
                              ? 'bg-primary text-white hover:bg-primary/90 hover:text-white shadow-lg shadow-primary/30' 
                              : 'text-text-secondary'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-primary'}`} />
                          {item.label}
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            if (item.children) {
                              toggleExpand(item.label);
                            }
                          }}
                          className={`group relative flex w-full items-center gap-2.5 rounded-xl px-4 py-3 font-medium duration-300 ease-in-out hover:bg-surface hover:text-text-primary ${
                            isActive
                              ? 'text-primary font-semibold'
                              : 'text-text-secondary'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-primary'}`} />
                          {item.label}
                          
                          {item.children && (
                            <ChevronDown 
                              className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          )}
                        </button>
                      )}

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {item.children && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                              {item.children.map((child, childIndex) => (
                                <li key={childIndex}>
                                  <Link
                                    href={child.path}
                                    className={`group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium duration-300 ease-in-out hover:text-primary ${
                                      child.path === pathname ? 'text-primary font-bold bg-primary/10 shadow-sm shadow-primary/20 ring-1 ring-primary/20' : 'text-text-muted'
                                    }`}
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="mt-auto px-4 lg:px-6 mb-8">
          <button
            onClick={handleLogout}
            className="group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-red-400 duration-300 ease-in-out hover:bg-[#333a48] hover:text-red-300"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
