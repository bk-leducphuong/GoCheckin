import React, { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useEventStore } from "@/store/eventStore";
import { EventStatus } from "@/types/event";
interface EventStatusCheckProps {
  eventCode: string;
  eventNotStartedFallback: React.ReactNode;
  eventCompletedFallback: React.ReactNode;
  children: React.ReactNode;
}

export default function EventStatusCheck({
  eventCode,
  eventNotStartedFallback,  
  eventCompletedFallback,
  children,
}: EventStatusCheckProps) {
  const [isEventStarted, setIsEventStarted] = useState(false);
  const [isEventCompleted, setIsEventCompleted] = useState(false);
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
        if (eventStatus === EventStatus.ACTIVE) {
          setIsEventStarted(true);
        } else if (eventStatus === EventStatus.COMPLETED) {
          setIsEventCompleted(true);
        } else if (eventStatus === EventStatus.PUBLISHED) {
          setIsEventNotStarted(true);
        }
      }
    };
    checkEventStatus();
  }, [eventCode, getEventStatus]);

  if (isEventStarted) {
    return <>{children}</>;
  } else if (isEventCompleted) {
    return <>{eventCompletedFallback}</>;
  } else if (isEventNotStarted) {
    return <>{eventNotStartedFallback}</>;
  }
}
