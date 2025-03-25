'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { UserRole } from '@/types/auth';
import { useAuthStore } from '@/store/authStore';
import { useShallow } from 'zustand/react/shallow'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuthStore(useShallow(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading
  })));
  const router = useRouter();

  useEffect(() => {
    // console.log('user', user);
    // Redirect if not authenticated or not an admin
    if (!isLoading && (!isAuthenticated || user?.role !== UserRole.ADMIN)) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not an admin
  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
