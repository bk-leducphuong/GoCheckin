"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useShallow } from "zustand/react/shallow";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Camera from "@/components/ui/Camera";
import { CheckInService } from '@/services/checkin.service';
import { GuestCheckIn } from '@/types/checkin';

// Placeholder data for guest list
const MOCK_GUESTS = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    code: "G001",
    status: "Checked In",
    checkInTime: "10:30 AM",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    code: "G002",
    status: "Registered",
    checkInTime: "-",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@example.com",
    code: "G003",
    status: "Checked In",
    checkInTime: "09:15 AM",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@example.com",
    code: "G004",
    status: "Registered",
    checkInTime: "-",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david@example.com",
    code: "G005",
    status: "Checked In",
    checkInTime: "11:45 AM",
  },
];

// Guest check-in validation schema
const checkInSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(6, "Phone number is required"),
  purpose: z.string().min(5, "Please enter the purpose of visit"),
});

type CheckInFormData = z.infer<typeof checkInSchema>;

export default function POCDashboard() {
  const { user } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
    }))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [guestCode, setGuestCode] = useState("");
  const [note, setNote] = useState("");
  const [guestImage, setGuestImage] = useState<string | null>(null);
  const [guests, setGuests] = useState(MOCK_GUESTS);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const {
    handleSubmit,
    reset,
  } = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
  });

  const checkInService = CheckInService.getInstance();

  // Filter guests based on search query
  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data: CheckInFormData) => {
    try {
      setIsLoading(true);

      const checkInData: GuestCheckIn = {
        ...data,
        guestCode,
        notes: note || undefined,
      };

      const imageResponse = await checkInService.uploadGuestImage(guestImage);

      const response = await checkInService.checkInGuest(checkInData);

      if (response.success) {
        // Reset form and show success message
        reset();
        setGuestImage(null);
        setGuestCode('');
        setNote('');
        alert('Guest checked in successfully!');
        
        // Refresh guest list
        const guestListResponse = await checkInService.getGuestList();
        if (guestListResponse.success && guestListResponse.data) {
          setGuests(Array.isArray(guestListResponse.data) ? guestListResponse.data : []);
        }
      } else {
        throw new Error(response.message || 'Failed to check in guest');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert(error instanceof Error ? error.message : 'Failed to check in guest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = (imageData: string) => {
    setGuestImage(imageData);
  };

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
            <div className="flex items-center bg-blue-50 px-4 py-2 rounded-md">
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
                  {user?.email || "POC User"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Check-in Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Guest Check-in
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
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
              <Button type="submit" isLoading={isLoading} className="w-full">
                Check In Guest
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Section 3: Guest List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Guest List</h2>
          <div className="w-full md:w-64 mt-2 md:mt-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Search guests..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Code
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Check-in Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGuests.length > 0 ? (
                filteredGuests.map((guest) => (
                  <tr key={guest.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {guest.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{guest.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{guest.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          guest.status === "Checked In"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {guest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {guest.checkInTime}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No guests found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCamera && (
        <Camera
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
