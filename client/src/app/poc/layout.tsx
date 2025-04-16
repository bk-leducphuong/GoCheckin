"use client";

import AuthCheck from "@/components/auth/AuthCheck";
import { UserRole } from "@/types/user";
import { useSearchParams } from "next/navigation";
import { usePocStore } from "@/store/pocStore";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useRouter } from "next/navigation";
import EventStatusCheck from "@/components/poc/EventStatusCheck";

export default function PocLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pointCode = searchParams.get("pointCode") as string;
  const eventCode = searchParams.get("eventCode") as string;

  const { validatePoc } = usePocStore(
    useShallow((state) => ({
      validatePoc: state.validatePoc,
    }))
  );

  useEffect(() => {
    const validatePocData = async () => {
      try {
        const response = await validatePoc(pointCode, eventCode);
        if (!response.success) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error validating POC data:", error);
        router.push("/login");
      }
    };
    validatePocData();
  }, [pointCode, eventCode, router, validatePoc]);

  return (
    <EventStatusCheck
      eventCode={eventCode}
      eventNotStartedFallback={
        <div className="flex items-center justify-center min-h-screen flex-col">
          <div className="text-2xl font-bold mb-4">Event Not Started Yet</div>
          <div className="text-gray-600">
            The event you are trying to access has not started yet. Please check
            back later.
          </div>
        </div>
      }
    >
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
    </EventStatusCheck>
  );
}
