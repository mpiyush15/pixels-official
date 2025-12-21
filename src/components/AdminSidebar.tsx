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
  FolderKanban,
  ExternalLink,
  UserCog,
  Image,
  MessageCircle,
  Upload,
  Building,
  DollarSign,
  Wallet,
  Calendar
} from 'lucide-react';
import { useState, useEffect } from 'react';

const menuItems = [
  // Dashboard
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', category: 'Dashboard' },
  
  // CRM - Customer Relationship Management
  { icon: Mail, label: 'Leads', path: '/admin/leads', category: 'CRM' },
  { icon: Users, label: 'Clients', path: '/admin/clients', category: 'CRM' },
  { icon: FolderKanban, label: 'Projects', path: '/admin/projects', category: 'CRM' },
  { icon: Calendar, label: 'Schedule', path: '/admin/schedule', category: 'CRM' },
  { icon: MessageCircle, label: 'Project Chats', path: '/admin/chats', category: 'CRM' },
  { icon: Upload, label: 'Submitted Work', path: '/admin/submitted-work', category: 'CRM' },
  
  // Business Management
  { icon: TrendingUp, label: 'Business Overview', path: '/admin/overview', category: 'Business' },
  { icon: UserCog, label: 'Staff Management', path: '/admin/staff', category: 'Business' },
  { icon: FileText, label: 'Task Management', path: '/admin/tasks', category: 'Business' },
  { icon: Image, label: 'Daily Content', path: '/admin/daily-content', category: 'Business' },
  
  // Accounts & Finance
  { icon: FileText, label: 'Invoices', path: '/admin/invoices', category: 'Accounts' },
  { icon: CreditCard, label: 'Payments', path: '/admin/payments', category: 'Accounts' },
  { icon: Wallet, label: 'Staff Payments', path: '/admin/staff-payments', category: 'Accounts' },
  { icon: Building, label: 'Vendors', path: '/admin/vendors', category: 'Accounts' },
  { icon: Receipt, label: 'Expenses', path: '/admin/expenses', category: 'Accounts' },
  { icon: DollarSign, label: 'Salaries', path: '/admin/salaries', category: 'Accounts' },
  
  // Personal Accounts
  { icon: Wallet, label: 'Personal Accounts', path: '/admin/personal-accounts', category: 'Personal' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/chat/unread-count');
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // DISABLED: Poll every 10 seconds for new messages
    // const interval = setInterval(fetchUnreadCount, 10000);
    // return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <>
      <style jsx>{`
        nav::-webkit-scrollbar {
          width: 6px;
        }
        nav::-webkit-scrollbar-track {
          background: #111827;
        }
        nav::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
        }
        nav::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
      
      {/* Mobile Header - Logo centered */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-center relative">
          {/* Hamburger Button - Absolute Left */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="absolute left-0 text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          {/* Logo/Title - Centered */}
          <div className="text-center">
            <h1 className="text-lg font-light text-white">Pixels Digital</h1>
            <p className="text-gray-400 text-xs font-light">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: 0 }}
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-black border-r border-white/10 flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 mt-[73px] lg:mt-0`}
      >
        {/* Logo - Desktop Only */}
        <div className="hidden lg:block p-8 border-b border-white/10 flex-shrink-0">
          <h1 className="text-2xl font-light text-white">Pixels Digital</h1>
          <p className="text-gray-400 text-sm font-light mt-1">Admin Dashboard</p>
        </div>

        {/* Menu Items - Scrollable */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#374151 #111827'
        }}>
          {/* Dashboard Section */}
          {menuItems.filter(item => item.category === 'Dashboard').map((item) => {
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
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

          {/* CRM Section */}
          <div className="pt-6">
            <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              CRM
            </h3>
            {menuItems.filter(item => item.category === 'CRM').map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              const isChatsPage = item.path === '/admin/chats';
              const showBadge = isChatsPage && unreadCount > 0;

              return (
                <motion.button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <span className="font-light">{item.label}</span>
                  {showBadge && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Accounts Section */}
          <div className="pt-6">
            <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Accounts & Finance
            </h3>
            {menuItems.filter(item => item.category === 'Accounts').map((item) => {
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
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
          </div>

          {/* Personal Accounts Section */}
          <div className="pt-6">
            <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Personal
            </h3>
            {menuItems.filter(item => item.category === 'Personal').map((item) => {
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
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
          </div>

          {/* Business Management Section */}
          <div className="pt-6">
            <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Business
            </h3>
            {menuItems.filter(item => item.category === 'Business').map((item) => {
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
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
          </div>
          
          {/* Client Portal Link - Opens in new tab */}
          <motion.a
            href="/client-portal/login"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ x: 4 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors border border-blue-500/20 mt-6"
          >
            <ExternalLink className="w-5 h-5" strokeWidth={1.5} />
            <span className="font-light">Client Portal</span>
          </motion.a>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
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
