'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Wallet, 
  UserCog, 
  LogOut,
  ExternalLink,
  IndianRupee,
  FileText,
  TrendingUp,
  CreditCard,
  Receipt,
  DollarSign,
  Building,
  LineChart,
  CheckSquare,
  Calendar,
  Upload,
  Mail,
  FileCheck,
  MessageCircle,
  Image,
  ArrowLeft,
  PieChart
} from 'lucide-react';

const financeRoutes = [
  { icon: LayoutDashboard, label: 'Finance Command Center', path: '/admin/finance' },
  { icon: FileText, label: 'Master Ledger', path: '/admin/ledger' },
  { icon: PieChart, label: 'Profit & Loss', path: '/admin/profit-loss' },
  { icon: FileText, label: 'Invoices', path: '/admin/invoices' },
  { icon: TrendingUp, label: 'Receivables', path: '/admin/receivables' },
  { icon: Receipt, label: 'Expenses', path: '/admin/expenses' },
  { icon: DollarSign, label: 'Working Capital', path: '/admin/working-capital' },
];

const operationsRoutes = [
  { icon: FolderKanban, label: 'Active Projects', path: '/admin/projects' },
  { icon: CheckSquare, label: 'Task Management', path: '/admin/tasks' },
  { icon: Calendar, label: 'Schedule & Calendar', path: '/admin/schedule' },
  { icon: Upload, label: 'Submitted Work', path: '/admin/submitted-work' },
];

const crmRoutes = [
  { icon: Mail, label: 'Leads Pipeline', path: '/admin/leads' },
  { icon: Users, label: 'Client Directory', path: '/admin/clients' },
  { icon: FileCheck, label: 'Quotations', path: '/admin/quotations' },
  { icon: MessageCircle, label: 'Project Chats', path: '/admin/chats' },
];

const teamRoutes = [
  { icon: UserCog, label: 'Staff Management', path: '/admin/staff' },
  { icon: Wallet, label: 'Staff Payments', path: '/admin/staff-payments' },
  { icon: Image, label: 'Daily Content', path: '/admin/daily-content' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Helper to determine which department we are currently viewing
  const isFinance = financeRoutes.some(r => pathname.startsWith(r.path));
  const isOperations = operationsRoutes.some(r => pathname.startsWith(r.path)) || pathname === '/admin/operations';
  const isCrm = crmRoutes.some(r => pathname.startsWith(r.path)) || pathname === '/admin/crm';
  const isTeam = teamRoutes.some(r => pathname.startsWith(r.path)) || pathname === '/admin/team';

  let currentRoutes: Array<{icon: any, label: string, path: string}> = [];
  let departmentTitle = 'Pixels OS';
  let departmentSubtitle = 'App Launcher';

  if (isFinance) {
    currentRoutes = financeRoutes;
    departmentTitle = 'Finance Hub';
    departmentSubtitle = 'Accounts Department';
  } else if (isOperations) {
    currentRoutes = operationsRoutes;
    departmentTitle = 'Operations Hub';
    departmentSubtitle = 'Projects Department';
  } else if (isCrm) {
    currentRoutes = crmRoutes;
    departmentTitle = 'CRM Hub';
    departmentSubtitle = 'Sales Department';
  } else if (isTeam) {
    currentRoutes = teamRoutes;
    departmentTitle = 'Team Hub';
    departmentSubtitle = 'HR Department';
  } else {
    // We are on the App Launcher or some other global page
    departmentTitle = 'Pixels OS';
    departmentSubtitle = 'Central Command';
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed', error);
      router.push('/admin/login'); // Fallback
    }
  };

  return (
    <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 z-50 hidden lg:flex flex-col">
      <div className="p-8 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{departmentTitle}</h1>
        <p className="text-gray-500 text-sm font-medium mt-1">{departmentSubtitle}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {currentRoutes.length > 0 && (
          <motion.button
            onClick={() => router.push('/admin/dashboard')}
            whileHover={{ x: 4 }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 transition-all font-medium text-[15px] mb-4 border border-gray-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            <span>Switch Department</span>
          </motion.button>
        )}

        {currentRoutes.length === 0 && (
           <div className="px-4 py-8 text-center text-gray-400 text-sm font-medium">
             Select a department from the App Launcher to see tools.
           </div>
        )}

        {currentRoutes.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');

          return (
            <motion.button
              key={item.path}
              onClick={() => router.push(item.path)}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative ${
                isActive
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-600 hover:text-black hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-medium text-[15px]">{item.label}</span>
            </motion.button>
          );
        })}

        {currentRoutes.length === 0 && (
          <motion.a
            href="/client-portal/login"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ x: 4 }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors mt-6 font-medium text-[15px]"
          >
            <ExternalLink className="w-5 h-5" strokeWidth={1.5} />
            <span>Client Portal Access</span>
          </motion.a>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 4 }}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-[15px]"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          <span>Logout System</span>
        </motion.button>
      </div>
    </div>
  );
}
