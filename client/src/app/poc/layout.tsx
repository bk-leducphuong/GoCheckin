"use client";

import AuthCheck from "@/components/auth/AuthCheck";
import { UserRole } from "@/types/user";
import { useSearchParams } from "next/navigation";
import EventStatusCheck from "@/components/poc/EventStatusCheck";
import PocValidation from "@/components/poc/PocValidation";

export default function PocLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pointCode = searchParams.get("pointCode") as string;
  const eventCode = searchParams.get("eventCode") as string;

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
        <PocValidation
          eventCode={eventCode}
          pointCode={pointCode}
          fallback={
            <div className="flex items-center justify-center min-h-screen flex-col">
              <div className="text-2xl font-bold mb-4">
                Poc Code or Event Code is not valid
              </div>
              <div className="text-gray-600">
                Please try again with a valid PoC code or Event code.
              </div>
            </div>
          }
        >
          <div className="min-h-screen bg-gray-100">{children}</div>
        </PocValidation>
      </AuthCheck>
    </EventStatusCheck>
  );
}
