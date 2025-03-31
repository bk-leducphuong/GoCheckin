"use client";

import AuthCheck from "@/components/auth/AuthCheck";
import { UserRole } from "@/types/auth";

export default function PocLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthCheck
      allowedRoles={[UserRole.POC]}
      redirectTo="/login"
      fallback={
        <div className="flex items-center justify-center min-h-screen flex-col">
          <div className="text-2xl font-bold mb-4">Access Denied</div>
          <div className="text-gray-600">
            You don&apos;t have permission to access this page.
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-100">{children}</div>
    </AuthCheck>
  );
}
