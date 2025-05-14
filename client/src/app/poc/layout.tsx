import AuthCheck from "@/components/auth/AuthCheck";
import { UserRole } from "@/types/user";

export default function PocLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthCheck allowedRoles={UserRole.POC} redirectTo="/login">
      {children}
    </AuthCheck>
  );
}
