"use client";

import React, { useState, useEffect } from "react";
import { Event } from "@/types/event";
import { useSocketStore } from "@/store/socketStore";
import { GuestService } from "@/services/guest.service";
import { EventService } from "@/services/event.service";
import { useShallow } from "zustand/shallow";
import { useParams } from "next/navigation";
import { CheckInResponse } from "@/types/checkin";

export default function RealtimeDashboard() {
  const [guests, setGuests] = useState<CheckInResponse[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { socket, connect, leaveRoom, joinRoom } = useSocketStore(
    useShallow((state) => ({
      socket: state.socket,
      connect: state.connect,
      disconnect: state.disconnect,
      leaveRoom: state.leaveRoom,
      joinRoom: state.joinRoom,
    }))
  );

  const eventCode = useParams().eventCode as string;

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch event details
        const eventData = await EventService.getEventByCode(eventCode);
        setEvent(eventData);

        // Fetch guest list
        const guestList = await GuestService.getAllGuestsOfEvent(eventCode);
        setGuests(guestList);
      } catch (error) {
        setError("Failed to fetch event data");
        console.error("Error fetching event data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventCode]);

  // Socket event handlers for real-time updates
  useEffect(() => {
    if (!socket) {
      connect();
    }

    joinRoom(eventCode);

    socket?.on("new_checkin_received", (newCheckin: CheckInResponse) => {
      guests.push(newCheckin);
    });

    return () => {
      leaveRoom(eventCode);
    };
  }, [socket, eventCode, connect, joinRoom, leaveRoom, guests]);

  const checkedInCount = guests.length;
  const totalCapacity = event?.capacity || 0;
  const checkInRate =
    totalCapacity > 0 ? Math.round((checkedInCount / totalCapacity) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-sm text-red-600">{error || "Event not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {event.eventName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(event.startTime).toLocaleString()} -{" "}
              {new Date(event.endTime).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">{event.venueName}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {Math.floor(
                (Date.now() - new Date(event.startTime).getTime()) / 60000
              )}{" "}
              min
            </div>
            <div className="text-sm text-gray-500">Running Time</div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Checked In</h3>
          <p className="text-2xl font-bold text-gray-900">{checkedInCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Capacity</h3>
          <p className="text-2xl font-bold text-gray-900">{totalCapacity}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Check-in Rate</h3>
          <p className="text-2xl font-bold text-gray-900">{checkInRate}%</p>
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Check-ins
          </h3>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {guests.length > 0 ? (
            guests.map((guest, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {guest.guestInfo.guestCode}
                    </p>
                    <p className="text-sm text-gray-500">
                      Description: {guest.guestInfo.description}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p className="text-sm text-gray-500">
                      {guest.checkinInfo.pointCode}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {guest.checkinInfo.checkinTime
                      ? new Date(
                          guest.checkinInfo.checkinTime
                        ).toLocaleTimeString()
                      : "Pending"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">
              No check-ins yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
