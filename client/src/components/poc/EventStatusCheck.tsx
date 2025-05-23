import React, { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useEventStore } from "@/store/poc/eventStore";
import { EventStatus } from "@/types/event";
interface EventStatusCheckProps {
  eventCode: string;
  eventNotStartedFallback: React.ReactNode;
  children: React.ReactNode;
}

export default function EventStatusCheck({
  eventCode,
  eventNotStartedFallback,
  children,
}: EventStatusCheckProps) {
  const [isEventNotStarted, setIsEventNotStarted] = useState(false);

  const { getEventStatus } = useEventStore(
    useShallow((state) => ({
      getEventStatus: state.getEventStatus,
    }))
  );
  useEffect(() => {
    const checkEventStatus = async () => {
      if (eventCode) {
        const eventStatus = await getEventStatus(eventCode);
        if (eventStatus === EventStatus.PUBLISHED) {
          setIsEventNotStarted(true);
        }
      }
    };
    checkEventStatus();
  }, [eventCode, getEventStatus]);

  if (isEventNotStarted) {
    return <>{eventNotStartedFallback}</>;
  } else {
    return <>{children}</>;
  }
}
