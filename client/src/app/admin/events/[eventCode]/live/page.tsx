"use client";

import React, { useState } from "react";
import { Event } from "@/types/event";

interface Guest {
  guestId: string;
  guestCode: string;
  name: string | null;
  email: string | null;
  checkedInAt: string | null;
}

export default function RealtimeDashboard() {
  const [event, setEvent] = useState<Event | null>({
    eventCode: "EVENT123",
    eventName: "Sample Event",
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    venueName: "Sample Venue",
    capacity: 10,
  } as Event | null);
  const [guests, setGuests] = useState<Guest[]>([{
    guestId: "GUEST123",
    guestCode: "GUEST123",
    name: "John Doe",
    email: "johndoe@example.com",
    checkedInAt: new Date().toISOString(),
  }, 
{
    guestId: "GUEST456",
    guestCode: "GUEST456",
    name: "Jane Doe",
    email: "janedoe@example.com",
    checkedInAt: new Date().toISOString(),
}, {
    guestId: "GUEST789",
    guestCode: "GUEST789",
    name: "Bob Smith",
    email: "bobsmith@example.com",
    checkedInAt: new Date().toISOString(),
}]);


//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

  if (!event) {
    return <div>Event not found</div>;
  }

  const checkedInCount = guests.length;
  const totalCapacity = event.capacity || 0;
  const checkInRate =
    totalCapacity > 0 ? Math.round((checkedInCount / totalCapacity) * 100) : 0;

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
              100
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
            guests.map((guest) => (
              <div key={guest.guestId} className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {guest.name || guest.guestCode}
                    </p>
                    <p className="text-sm text-gray-500">
                      {guest.email || "No email provided"}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(guest.checkedInAt!).toLocaleTimeString()}
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
