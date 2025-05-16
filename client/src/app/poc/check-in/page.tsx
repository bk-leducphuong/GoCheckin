"use client";

import React, { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import Button from "@/components/ui/Button";
import Camera from "@/components/ui/Camera";
import { GuestCheckinInfo } from "@/types/checkin";
import { useSearchParams } from "next/navigation";
import GuestList from "@/components/poc/GuestList";
import { useCheckinStore } from "@/store/checkinStore";
import { useSocketStore } from "@/store/socketStore";
import { useEventStore } from "@/store/eventStore";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { EventStatus } from "@/types/event";
import { ApiError } from "@/lib/error";
import { FaCamera } from "react-icons/fa6";
import { MdOutlineCameraAlt } from "react-icons/md";

export default function CheckinPage() {
  // Connect socket
  const { sendCheckinSocketEvent } = useSocketStore(
    useShallow((state) => ({
      sendCheckinSocketEvent: state.sendCheckinSocketEvent,
    }))
  );

  const { checkinGuest, uploadGuestImage } = useCheckinStore(
    useShallow((state) => ({
      checkinGuest: state.checkinGuest,
      uploadGuestImage: state.uploadGuestImage,
      guests: state.guests,
    }))
  );

  const { selectedEvent, getEventByCode } = useEventStore(
    useShallow((state) => ({
      selectedEvent: state.selectedEvent,
      setSelectedEvent: state.setSelectedEvent,
      getEventByCode: state.getEventByCode,
    }))
  );

  const searchParams = useSearchParams();
  const eventCode = searchParams.get("eventCode") as string;
  const pointCode = searchParams.get("pointCode") as string;
  const [guestCode, setGuestCode] = useState("");
  const [note, setNote] = useState("");
  const [guestImage, setGuestImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        await getEventByCode(eventCode);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Failed to fetch event details. Please try again.");
        }
      }
    };

    fetchEvent();
  });

  const submitCheckin = async () => {
    try {
      setIsLoading(true);
      let imageUrl;
      if (guestImage) {
        imageUrl = await uploadGuestImage(guestImage);
      }

      const checkInData: GuestCheckinInfo = {
        guestCode,
        eventCode: eventCode,
        pointCode: pointCode,
        notes: note,
        imageUrl,
      };

      const checkinResponse = await checkinGuest(checkInData);

      sendCheckinSocketEvent(checkinResponse);

      setGuestImage(null);
      setGuestCode("");
      setNote("");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to check in guest. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = (imageData: string) => {
    setGuestImage(imageData);
  };

  if (isLoading || !selectedEvent) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Section 2: Check-in Section */}
      {selectedEvent.eventStatus === EventStatus.ACTIVE && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Guest Check-in
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Guest Image Capture */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guest Photo
              </label>
              <div
                className="bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden"
                style={{ height: "200px" }}
              >
                {guestImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={guestImage}
                      alt="Guest Photo"
                      className="object-cover w-full h-full"
                      onError={() => setGuestImage("/placeholder-guest.jpg")}
                    />
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <MdOutlineCameraAlt className="w-10 h-10 text-gray-400 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">
                      No photo captured
                    </p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaCamera className="mr-2" />
                Capture Photo
              </button>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col space-y-4">
              {/* Guest Code Input */}
              <div>
                <label
                  htmlFor="guestCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Guest Code
                </label>
                <input
                  type="text"
                  id="guestCode"
                  value={guestCode}
                  onChange={(e) => setGuestCode(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter guest code (e.g. G001)"
                  required
                />
              </div>

              {/* Notes Input */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Add any notes about the check-in"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  onClick={submitCheckin}
                  isLoading={isLoading}
                  className="w-full"
                >
                  Check In Guest
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Section 3: Guest List */}
      <GuestList></GuestList>

      {showCamera && (
        <Camera
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
