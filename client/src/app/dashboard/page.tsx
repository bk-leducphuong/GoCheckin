'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { UserRole } from '@/types/auth';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">GoCheckin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              {user?.email} ({user?.role})
            </span>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-2 border-gray-200 rounded-lg p-6">
            {user?.role === UserRole.ADMIN ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
                <p className="mb-4">Welcome to your admin dashboard. As an administrator, you can:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Manage events and attendees</li>
                  <li>Create new POC accounts</li>
                  <li>View analytics and reports</li>
                  <li>Configure system settings</li>
                </ul>
              </div>
            ) : user?.role === UserRole.POC ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">POC Dashboard</h2>
                <p className="mb-4">Welcome to your POC dashboard. As a point of contact, you can:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Manage your assigned events</li>
                  <li>Check in attendees</li>
                  <li>View event statistics</li>
                  <li>Generate event reports</li>
                </ul>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600">User role not recognized.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 