'use client';

import AdminSidebar from '@/components/AdminSidebar';
import TopBar from '@/components/TopBar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <TopBar />
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
