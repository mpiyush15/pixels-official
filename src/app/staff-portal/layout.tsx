'use client';

import { usePathname } from 'next/navigation';
import { useAutoLogout } from '@/hooks/useAutoLogout';

export default function StaffPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/staff-portal/login';

  // Auto logout after 5 minutes of inactivity (only when logged in)
  useAutoLogout({
    timeout: 5 * 60 * 1000, // 5 minutes
    logoutEndpoint: '/api/staff-auth/logout',
    redirectPath: '/staff-portal/login',
    enabled: !isLoginPage,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
