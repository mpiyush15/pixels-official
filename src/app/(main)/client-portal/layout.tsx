'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import ClientSidebar from '@/components/ClientSidebar';
import ClientTopBar from '@/components/ClientTopBar';
import { useAutoLogout } from '@/hooks/useAutoLogout';

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [clientName, setClientName] = useState('');
  
  // Don't show sidebar/topbar on login, forgot-password, and reset-password pages
  const isAuthPage = 
    pathname === '/client-portal/login' || 
    pathname === '/client-portal/forgot-password' ||
    Boolean(pathname?.startsWith('/client-portal/reset-password'));

  // Fetch client info
  useEffect(() => {
    if (!isAuthPage) {
      fetchClientInfo();
    }
  }, [isAuthPage]);

  const fetchClientInfo = async () => {
    try {
      const response = await fetch('/api/client-auth/session');
      const data = await response.json();
      if (data.authenticated && data.client) {
        setClientName(data.client.name);
      }
    } catch (error) {
      console.error('Error fetching client info:', error);
    }
  };

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ClientSidebar />
      <main className="flex-1 overflow-y-auto flex flex-col pt-[58px] lg:pt-0">
        <ClientTopBar clientName={clientName} />
        <div className="flex-1 p-0">
          {children}
        </div>
      </main>
    </div>
  );
}
