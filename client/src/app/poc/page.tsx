"use client";
import { useEffect, useState } from "react";
import { usePocStore } from "@/store/poc/pocStore";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/store/poc/authStore";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { useEventStore } from "@/store/poc/eventStore";
import { Event } from "@/types/event";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/error";
import { GrTransaction } from "react-icons/gr";
import { EventStatus } from "@/types/event";
interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  eventCode: string;
}

export default function PocDashboardPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const router = useRouter();

  const { pocList, getPocsByUserId } = usePocStore(
    useShallow((state) => ({
      pocList: state.pocList,
      getPocsByUserId: state.getPocsByUserId,
    }))
  );

  const {
    events: joinedEvents,
    getEventByCode,
    setEvents,
    setSelectedEvent,
  } = useEventStore(
    useShallow((state) => ({
      events: state.events,
      getEventByCode: state.getEventByCode,
      setEvents: state.setEvents,
      setSelectedEvent: state.setSelectedEvent,
    }))
  );

  const { userId } = useAuthStore(
    useShallow((state) => ({
      userId: state.userId,
    }))
  );

  useEffect(() => {
    const getAllRegisteredPocs = async () => {
      try {
        if (userId) {
          setIsLoading(true);
          await getPocsByUserId(userId);
        } else {
          setError("Authentication error");
        }
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    getAllRegisteredPocs();
  }, [getPocsByUserId, userId]);

  useEffect(() => {
    const getAllEvents = async () => {
      try {
        setIsLoading(true);
        const joinedEvents: Event[] = [];
        for (const poc of pocList) {
          const event = await getEventByCode(poc.eventCode);
          joinedEvents.push(event);
        }
        setEvents(joinedEvents);

        // Mock recent activities for demonstration
        const mockActivities: Activity[] = joinedEvents.map((event, index) => ({
          id: `activity-${index}`,
          type: "checkin",
          description: `Check-in at ${event.eventName}`,
          timestamp: new Date(Date.now() - index * 86400000).toISOString(),
          eventCode: event.eventCode,
        }));

        setActivities(mockActivities);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (pocList.length > 0) {
      getAllEvents();
    } else {
      setIsLoading(false);
    }
  }, [getEventByCode, pocList, setEvents]);

  const redirectToCheckinPage = (eventCode: string) => {
    const poc = pocList.filter((poc) => poc.eventCode === eventCode);
    const event = joinedEvents.find((event) => event.eventCode === eventCode);
    if (event && poc.length > 0) {
      router.push(
        `/poc/check-in?pointCode=${poc[0].pointCode}&eventCode=${eventCode}`
      );
    }
  };

  const redirectToEventDetailsPage = (eventCode: string) => {
    const event = joinedEvents.find((event) => event.eventCode === eventCode);
    if (event) {
      setSelectedEvent(event);
      router.push(`/poc/event-details?eventCode=${eventCode}`);
    }
  };

  const redirectToAnalyzeEventPage = (eventCode: string) => {
    const poc = pocList.filter((poc) => poc.eventCode === eventCode);
    const event = joinedEvents.find((event) => event.eventCode === eventCode);
    if (event && poc.length > 0) {
      setSelectedEvent(event);
      router.push(
        `/poc/analyze-event?eventCode=${eventCode}&pointCode=${poc[0].pointCode}`
      );
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">POC Dashboard</h1>
        <Link href="/register/event">
          <Button variant="primary">Register New Event</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Joined Events */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Events</h2>

          {joinedEvents.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No events joined yet
            </div>
          ) : (
            <div className="space-y-4">
              {joinedEvents.map((event) => (
                <div
                  key={event.eventId}
                  className="border rounded-md p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{event.eventName}</h3>
                    <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {event.eventStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.venueName}
                  </p>
                  <div className="text-sm text-gray-500 mt-2">
                    {new Date(event.startTime).toLocaleDateString()} -{" "}
                    {new Date(event.endTime).toLocaleDateString()}
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    <div
                      onClick={() =>
                        redirectToEventDetailsPage(event.eventCode)
                      }
                    >
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                      >
                        View Event Details
                      </Button>
                    </div>
                    {event.eventStatus === EventStatus.ACTIVE && (
                      <div
                        onClick={() => redirectToCheckinPage(event.eventCode)}
                      >
                        <Button
                          variant="outline"
                          className="w-full cursor-pointer"
                        >
                          Go to Check-in
                        </Button>
                      </div>
                    )}
                    <div
                      onClick={() =>
                        redirectToAnalyzeEventPage(event.eventCode)
                      }
                    >
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                      >
                        Analyze Event
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>

          {activities.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No recent activities
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start border-b pb-3 last:border-0"
                >
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <GrTransaction className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
