"use client";

import AuthCheck from "@/components/auth/AuthCheck";
import { UserRole } from "@/types/auth";
import { useSearchParams } from "next/navigation";
import { usePocStore } from "@/store/pocStore";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useRouter } from "next/navigation";

export default function PocLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pocId = searchParams.get("pocId");
  const eventCode = searchParams.get("eventCode");
  const router = useRouter();

  const { validatePoc } = usePocStore(
    useShallow((state) => ({
      validatePoc: state.validatePoc,
    }))
  );

  useEffect(() => {
    const validatePocData = async () => {
      if (pocId && eventCode) {
        const response = await validatePoc(pocId, eventCode);
        if (!response.success) {
          router.push("/login");
        }
      }
    };
    validatePocData();
  }, [pocId, eventCode, router, validatePoc]);

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
