'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  LogOut,
  Menu,
  X,
  FolderKanban,
  Receipt,
  MessageCircle,
  Upload,
  User,
  CheckSquare,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/client-portal/dashboard' },
  { icon: FolderKanban, label: 'Projects', path: '/client-portal/projects' },
  { icon: CheckSquare, label: 'Tasks', path: '/client-portal/tasks' },
  { icon: Upload, label: 'Submit Work', path: '/client-portal/submit-work' },
  { icon: MessageCircle, label: 'Chats', path: '/client-portal/chats' },
  { icon: FileText, label: 'Invoices', path: '/client-portal/invoices' },
  { icon: Receipt, label: 'Payments', path: '/client-portal/payments' },
  { icon: User, label: 'Profile', path: '/client-portal/profile' },
];

export default function ClientSidebar() {
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
    await fetch('/api/client-auth/logout', { method: 'POST' });
    router.push('/client-portal/login');
  };

  return (
    <>
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
            <p className="text-gray-400 text-xs font-light">Client Portal</p>
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
          <p className="text-gray-400 text-sm font-light mt-1">Client Portal</p>
        </div>

        {/* Menu Items - Scrollable */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            const isChatsPage = item.path === '/client-portal/chats';
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
