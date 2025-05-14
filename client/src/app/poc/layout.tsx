import AuthCheck from "@/components/auth/AuthCheck";
import { UserRole } from "@/types/user";
import Navigation from "@/components/poc/Navigation";

export default function PocLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthCheck allowedRoles={UserRole.POC} redirectTo="/login">
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </AuthCheck>
  );
}
