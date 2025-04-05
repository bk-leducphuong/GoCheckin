'use client';

import React from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { useAuthStore } from '@/store/authStore';
import AuthCheck from '@/components/auth/AuthCheck';
import { UserRole } from '@/types/user';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
      <AuthCheck 
        allowedRoles={[UserRole.ADMIN]} 
        redirectTo="/login"
        fallback={
          <div className="flex items-center justify-center min-h-screen flex-col">
            <div className="text-2xl font-bold mb-4">Access Denied</div>
            <div className="text-gray-600">You don&apos;t have permission to access this page.</div>
          </div>
        }
      >
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
      </AuthCheck>
  );
}
