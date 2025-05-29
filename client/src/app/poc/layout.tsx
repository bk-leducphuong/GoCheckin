"use client";

import AuthCheck from "@/components/auth/poc/AuthCheck";
import { UserRole } from "@/types/user";
import Navigation from "@/components/poc/Navigation";
import { usePathname, useSearchParams } from "next/navigation";

export default function PocLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams?.toString();
  const currentPath = query ? `${pathname}?${query}` : pathname;

  return (
    <AuthCheck allowedRoles={UserRole.POC} redirectTo={currentPath as string}>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </AuthCheck>
  );
}
