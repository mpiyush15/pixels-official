'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  TrendingUp, 
  Mail,
  LogOut,
  Menu,
  X,
  CreditCard,
  Receipt,
  FolderKanban
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Mail, label: 'Leads', path: '/admin/leads' },
  { icon: Users, label: 'Clients', path: '/admin/clients' },
  { icon: FolderKanban, label: 'Projects', path: '/admin/projects' },
  { icon: FileText, label: 'Invoices', path: '/admin/invoices' },
  { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
  { icon: Receipt, label: 'Expenses', path: '/admin/expenses' },
  { icon: TrendingUp, label: 'Business Overview', path: '/admin/overview' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-black text-white p-3 rounded-xl border border-white/10"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: 0 }}
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-black border-r border-white/10 flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="p-8 border-b border-white/10">
          <h1 className="text-2xl font-light text-white">Pixels Digital</h1>
          <p className="text-gray-400 text-sm font-light mt-1">Admin Dashboard</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <motion.button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setIsMobileMenuOpen(false);
                }}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-light">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <motion.button
            onClick={handleLogout}
            whileHover={{ x: 4 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="font-light">Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
