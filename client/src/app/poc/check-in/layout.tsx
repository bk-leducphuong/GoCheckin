"use client";

import { useSearchParams } from "next/navigation";
import EventStatusCheck from "@/components/poc/EventStatusCheck";
import PocValidation from "@/components/poc/PocValidation";
import PocSocket from "@/components/poc/PocSocket";

export default function CheckinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <PocSocket>
          <div className="min-h-screen bg-gray-100">{children}</div>
        </PocSocket>
      </PocValidation>
    </EventStatusCheck>
  );
}
