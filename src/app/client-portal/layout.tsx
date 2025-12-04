'use client';

import { usePathname } from 'next/navigation';
import ClientSidebar from '@/components/ClientSidebar';
import TopBar from '@/components/TopBar';
import { useAutoLogout } from '@/hooks/useAutoLogout';

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't show sidebar/topbar on login and forgot-password pages
  const isAuthPage = pathname === '/client-portal/login' || pathname === '/client-portal/forgot-password';

  // Auto logout after 5 minutes of inactivity (only when logged in)
  useAutoLogout({
    timeout: 5 * 60 * 1000, // 5 minutes
    logoutEndpoint: '/api/client-auth/logout',
    redirectPath: '/client-portal/login',
    enabled: !isAuthPage,
  });

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ClientSidebar />
      <main className="flex-1 overflow-y-auto flex flex-col pt-[73px] lg:pt-0">
        <TopBar />
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
