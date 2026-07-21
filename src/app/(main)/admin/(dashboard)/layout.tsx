'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminTopBar from '@/components/AdminTopBar';
import { usePathname } from 'next/navigation';
import { useAutoLogout } from '@/hooks/useAutoLogout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Auto logout after 5 minutes of inactivity
  useAutoLogout({
    timeout: 5 * 60 * 1000, // 5 minutes
    logoutEndpoint: '/api/auth/logout',
    redirectPath: '/admin/login',
    enabled: true,
  });

  return (
    <div className="bg-background text-text-primary transition-colors duration-300">
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* <!-- ===== Header Start ===== --> */}
          <AdminTopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </div>
  );
}
