"use client";

import AuthCheck from "@/components/auth/AuthCheck";
import { UserRole } from "@/types/user";
import { useSearchParams } from "next/navigation";
import { usePocStore } from "@/store/pocStore";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useRouter } from "next/navigation";
import EventStatusCheck from "@/components/poc/EventStatusCheck";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

export default function PocLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pointCode = searchParams.get("pointCode") as string;
  const eventCode = searchParams.get("eventCode") as string;

  const { poc, validatePoc } = usePocStore(
    useShallow((state) => ({
      poc: state.poc,
      validatePoc: state.validatePoc,
    }))
  );

  useEffect(() => {
    const validatePocData = async () => {
      try {
        setIsLoading(true);
        await validatePoc(pointCode, eventCode);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setError("System is having issues. Please try again later.");
      }
    };
    validatePocData();
  }, [pointCode, eventCode, router, validatePoc]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/login" />;
  }

  if (!poc) {
    return <Error message="POC not found" redirectTo="/login" />;
  }

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
      <AuthCheck allowedRoles={UserRole.POC} redirectTo="/login">
        <div className="min-h-screen bg-gray-100">{children}</div>
      </AuthCheck>
    </EventStatusCheck>
  );
}
