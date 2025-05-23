"use client";

import React from "react";
import Sidebar from "@/components/admin/Sidebar";
import AuthCheck from "@/components/auth/admin/AuthCheck";
import { UserRole } from "@/types/user";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCheck allowedRoles={UserRole.ADMIN} redirectTo="/login">
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
