'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Client {
  _id: string;
  name: string;
  email: string;
  company: string;
}

export default function StaffDashboardPage() {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/staff-auth/session');
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/staff-portal/login');
        return;
      }

      setStaff(data.staff);
      await fetchAssignedClients(data.staff.id);
    } catch (error) {
      router.push('/staff-portal/login');
    }
  };

  const fetchAssignedClients = async (staffId: string) => {
    try {
      const response = await fetch(`/api/staff/assigned-clients?staffId=${staffId}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/staff-auth/logout', { method: 'POST' });
    router.push('/staff-portal/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Pixels Digital - Staff Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {staff?.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="mt-1 text-sm text-gray-600">
              Role: <span className="font-medium capitalize">{staff?.role}</span>
            </p>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Assigned Clients ({clients.length})
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Clients you are currently working with
              </p>
            </div>
            <div className="bg-white">
              {clients.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No clients assigned yet
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {clients.map((client) => (
                    <li key={client._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <Link 
                        href={`/staff-portal/clients/${client._id}`}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-indigo-600">
                            {client.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {client.company} • {client.email}
                          </p>
                        </div>
                        <div>
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M9 5l7 7-7 7"></path>
                          </svg>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/staff-portal/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Upload Content
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
