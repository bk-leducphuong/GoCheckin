import React, { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useEventStore } from "@/store/eventStore";
interface EventStatusCheckProps {
  eventCode: string;
  fallback: React.ReactNode;
  children: React.ReactNode;
}

export default function EventStatusCheck({
  eventCode,
  fallback,
  children,
}: EventStatusCheckProps) {
  const [isEventStarted, setIsEventStarted] = useState(false);

  const { checkEventStartingStatus } = useEventStore(
    useShallow((state) => ({
      checkEventStartingStatus: state.checkEventStartingStatus,
    }))
  );
  useEffect(() => {
    const checkEventStatus = async () => {
      if (eventCode) {
        const response = await checkEventStartingStatus(eventCode);
        setIsEventStarted(response);
      }
    };
    checkEventStatus();
  }, [eventCode, checkEventStartingStatus]);

  if (isEventStarted) {
    return <>{children}</>;
  } else {
    return <>{fallback}</>;
  }
}
