"use client";

import React from "react";
import Sidebar from "@/components/admin/Sidebar";
import AuthCheck from "@/components/auth/admin/AuthCheck";
import { UserRole } from "@/types/user";
import { usePathname, useSearchParams } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams?.toString();
  const currentPath = query ? `${pathname}?${query}` : pathname;

  return (
    <AuthCheck allowedRoles={UserRole.ADMIN} redirectTo={currentPath as string}>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthCheck>
  );
}
