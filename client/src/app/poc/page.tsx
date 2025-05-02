"use client";

import React, { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import Button from "@/components/ui/Button";
import Camera from "@/components/ui/Camera";
import { GuestCheckinInfo } from "@/types/checkin";
import { useSearchParams } from "next/navigation";
import GuestList from "@/components/poc/GuestList";
import { useUserStore } from "@/store/userStore";
import { useCheckinStore } from "@/store/checkinStore";
import MenuModal from "@/components/poc/MenuModal";
import { useSocketStore } from "@/store/socketStore";
import PocAnalysis from "@/components/poc/PocAnalysis";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

export default function POCDashboard() {
  // Connect socket
  const { socket, connect, disconnect, leaveRoom, joinRoom } = useSocketStore(
    useShallow((state) => ({
      socket: state.socket,
      connect: state.connect,
      disconnect: state.disconnect,
      leaveRoom: state.leaveRoom,
      joinRoom: state.joinRoom,
    }))
  );

  const { user } = useUserStore(
    useShallow((state) => ({
      user: state.user,
    }))
  );
  const { checkinGuest, uploadGuestImage } = useCheckinStore(
    useShallow((state) => ({
      checkinGuest: state.checkinGuest,
      uploadGuestImage: state.uploadGuestImage,
      guests: state.guests,
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
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      connect();
      joinRoom(eventCode);

      return () => {
        leaveRoom(eventCode);
        disconnect();
      };
    } catch (error) {
      setError("Checkin service is not available! Please try again later.");
      console.error("Error in useEffect:", error);
    }
  }, [eventCode, connect, joinRoom, leaveRoom, disconnect]);

  const submitCheckin = async () => {
    try {
      setIsLoading(true);

      // First upload the image if available
      let imageUrl;
      if (guestImage) {
        imageUrl = await uploadGuestImage(guestImage);
      }

      // Prepare the check-in data
      const checkInData: GuestCheckinInfo = {
        guestCode,
        eventCode: eventCode,
        pointCode: pointCode,
        notes: note,
        imageUrl,
      };

      // Call the check-in service
      const response = await checkinGuest(checkInData);

      socket?.emit("new_checkin", response);

      // Reset form and show success message
      setGuestImage(null);
      setGuestCode("");
      setNote("");
      alert("Guest checked in successfully!");
    } catch (error) {
      console.error("Check-in error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to check in guest. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = (imageData: string) => {
    setGuestImage(imageData);
  };

  const openMenu = () => {
    setShowMenu(true);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Section 1: Event and POC Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tech Conference 2023
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Date: November 15, 2023 • Location: Convention Center
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div
              className="flex items-center bg-blue-50 px-4 py-2 rounded-md cursor-pointer"
              onClick={openMenu}
            >
              <div className="mr-3">
                <svg
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Point of Contact</p>
                <p className="font-medium text-gray-900">
                  {user?.username || "POC User"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMenu && <MenuModal onClose={closeMenu} />}

      {/* Section 2: Check-in Section */}
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
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
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
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
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

      {/* Section 3: Guest List */}
      <GuestList></GuestList>

      <PocAnalysis eventCode={eventCode} pointCode={pointCode}></PocAnalysis>

      {showCamera && (
        <Camera
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
