'use client';

import AdminSidebar from '@/components/AdminSidebar';
import TopBar from '@/components/TopBar';
import { useAutoLogout } from '@/hooks/useAutoLogout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auto logout after 5 minutes of inactivity
  useAutoLogout({
    timeout: 5 * 60 * 1000, // 5 minutes
    logoutEndpoint: '/api/auth/logout',
    redirectPath: '/admin/login',
    enabled: true,
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto flex flex-col pt-[73px] lg:pt-0">
        <TopBar />
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
