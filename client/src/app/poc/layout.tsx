'use client';

import AuthGuard from '@/middleware/AuthGuard';

export default function PocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['poc']}>
      <div className="min-h-screen bg-gray-100">
        {children}
      </div>
    </AuthGuard>
  );
} 