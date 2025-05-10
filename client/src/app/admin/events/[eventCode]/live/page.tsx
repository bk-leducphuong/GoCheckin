"use client";

import React, { useState, useEffect } from "react";
import { useSocketStore } from "@/store/socketStore";
import { GuestService } from "@/services/guest.service";
import { useShallow } from "zustand/shallow";
import { useParams } from "next/navigation";
import { CheckInResponse } from "@/types/checkin";
import { useEventStore } from "@/store/eventStore";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { usePocStore } from "@/store/pocStore";

export default function RealtimeDashboard() {
  const [guests, setGuests] = useState<CheckInResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedPocs, setConnectedPocs] = useState<Set<string>>(new Set());

  const { socket, connect, registerAdmin, unregisterAdmin, disconnect } =
    useSocketStore(
      useShallow((state) => ({
        socket: state.socket,
        connect: state.connect,
        disconnect: state.disconnect,
        registerAdmin: state.registerAdmin,
        unregisterAdmin: state.unregisterAdmin,
      }))
    );

  const { selectedEvent, getEventByCode } = useEventStore(
    useShallow((state) => ({
      selectedEvent: state.selectedEvent,
      getEventByCode: state.getEventByCode,
    }))
  );

  const { getAllPocs, pocList } = usePocStore(
    useShallow((state) => ({
      getAllPocs: state.getAllPocs,
      pocList: state.pocList,
    }))
  );

  const eventCode = useParams().eventCode as string;

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        // Fetch event details
        await getEventByCode(eventCode);
        // Fetch guest list
        const guestList = await GuestService.getAllGuestsOfEvent(eventCode);
        setGuests(guestList);
        // Fetch POC list
        await getAllPocs(eventCode);
      } catch (error) {
        setError("Failed to fetch event data");
        console.error("Error fetching event data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventCode, getEventByCode, getAllPocs]);

  // Socket event handlers for real-time updates
  useEffect(() => {
    const setupSocket = async () => {
      try {
        const isConnected = await connect();
        if (!isConnected) {
          console.error("Failed to connect to socket"); // Don't log
          return;
        }

        registerAdmin(eventCode);

        return () => {
          unregisterAdmin(eventCode);
          disconnect();
        };
      } catch (error) {
        setError("Live checkin is not available");
        console.error("Error registering admin:", error);
      }
    };

    setupSocket();
  }, [eventCode, connect, registerAdmin, unregisterAdmin, disconnect]);

  useEffect(() => {
    if (socket) {
      socket.on("new_checkin_received", (newCheckin: CheckInResponse) => {
        setGuests((prevGuests) => [...prevGuests, newCheckin]);
      });

      socket.on(
        "poc_connected",
        (data: { eventCode: string; pointCode: string }) => {
          setConnectedPocs((prev) => new Set([...prev, data.pointCode]));
        }
      );

      socket.on(
        "poc_disconnected",
        (data: { eventCode: string; pointCode: string }) => {
          setConnectedPocs((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.pointCode);
            return newSet;
          });
        }
      );
    }

    return () => {
      if (socket) {
        socket.off("new_checkin_received");
        socket.off("poc_connected");
        socket.off("poc_disconnected");
      }
    };
  }, [socket]);

  const checkedInCount = guests.length;
  const totalCapacity = selectedEvent?.capacity || 0;
  const checkInRate =
    totalCapacity > 0 ? Math.round((checkedInCount / totalCapacity) * 100) : 0;

  if (isLoading || !selectedEvent) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error || "Event not found"} redirectTo="/login" />;
  }

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedEvent.eventName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(selectedEvent.startTime).toLocaleString()} -{" "}
              {new Date(selectedEvent.endTime).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">{selectedEvent.venueName}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {Math.floor(
                (Date.now() - new Date(selectedEvent.startTime).getTime()) /
                  60000
              )}{" "}
              min
            </div>
            <div className="text-sm text-gray-500">Running Time</div>
          </div>
        </div>
      </div>

      {/* POC List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Point of Check-in Status
          </h3>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {pocList.length > 0 ? (
            pocList.map((poc) => (
              <div key={poc.pocId} className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {poc.pointName}
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          connectedPocs.has(poc.pointCode)
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {connectedPocs.has(poc.pointCode)
                          ? "Online"
                          : "Offline"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Point Code: {poc.pointCode}
                    </p>
                    {poc.locationDescription && (
                      <p className="text-sm text-gray-500">
                        Location: {poc.locationDescription}
                      </p>
                    )}
                    {poc.floorLevel && (
                      <p className="text-sm text-gray-500">
                        Floor: {poc.floorLevel}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {poc.openTime && poc.closeTime && (
                      <div className="text-sm text-gray-500">
                        <p>
                          Open: {new Date(poc.openTime).toLocaleTimeString()}
                        </p>
                        <p>
                          Close: {new Date(poc.closeTime).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                    {poc.capacity && (
                      <p className="text-sm text-gray-500">
                        Capacity: {poc.capacity}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">
              No POCs configured for this event
            </div>
          )}
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
