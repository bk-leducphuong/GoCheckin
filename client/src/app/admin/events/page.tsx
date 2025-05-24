"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEventStore } from "@/store/admin/eventStore";
import { EventStatus } from "@/types/event";
import { useShallow } from "zustand/shallow";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { Event } from "@/types/event";
import { ApiError } from "@/lib/error";
import { FaLocationDot } from "react-icons/fa6";
import { FaCalendarAlt, FaUser } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";

export default function EventsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { events, getAllManagedEvents, setSelectedEvent } = useEventStore(
    useShallow((state) => ({
      setSelectedEvent: state.setSelectedEvent,
      events: state.events,
      getAllManagedEvents: state.getAllManagedEvents,
    }))
  );

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        await getAllManagedEvents();
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Failed to fetch events. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [getAllManagedEvents]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    router.push(`/admin/events/${event.eventCode}`);
  };

  const viewEventRealtime = (event: Event) => {
    setSelectedEvent(event);
    router.push(`/admin/events/${event.eventCode}/live`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/login" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Events Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Create and manage your events
        </p>
      </div>

      {/* Create Event Button */}
      <div className="flex justify-end">
        <button
          onClick={() => router.push("/admin/events/create")}
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaPlus className="mr-2" />
          Create Event
        </button>
      </div>

      {/* Events List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {events.map((item) => (
            <li
              key={item.eventId}
              className="bg-white hover:bg-gray-50 cursor-pointer"
              onClick={() => handleEventClick(item)}
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-blue-600 truncate">
                    {item.eventName}
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    {item.eventStatus === EventStatus.ACTIVE && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                    {item.eventStatus === EventStatus.COMPLETED && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    )}
                    {item.eventStatus === EventStatus.PUBLISHED && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Incoming
                      </span>
                    )}
                  </div>
                </div>
                {/* Event Images Gallery */}
                {item.images && item.images.length > 0 && (
                  <div className="mt-2 flex space-x-2 overflow-x-auto py-2">
                    {item.images.slice(0, 3).map((imgUrl, index) => (
                      <div key={index} className="relative flex-shrink-0">
                        <img
                          src={imgUrl}
                          alt={`${item.eventName} image ${index + 1}`}
                          width={120}
                          height={80}
                          className="h-20 w-30 object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span>{item.startTime.split("T")[0]}</span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      <FaLocationDot className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span>{item.venueName}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <FaUser className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <span>0 Attendees</span>
                  </div>
                </div>
                {item.eventStatus === EventStatus.ACTIVE && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      viewEventRealtime(item);
                    }}
                    type="button"
                    className="border-2 border-green-400 mt-4 rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                  >
                    View Realtime
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
