"use client";

import { useSearchParams } from "next/navigation";
import PocValidation from "@/components/poc/PocValidation";

export default function CheckinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const pointCode = searchParams.get("pointCode") as string;
  const eventCode = searchParams.get("eventCode") as string;

  return (
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
      {children}
    </PocValidation>
  );
}
