"use client";

import React, { useState, useEffect } from "react";
import { Event, EventStatus } from "@/types/event";
import { EventService } from "@/services/event.service";
import { PocService } from "@/services/poc.service";
import { ApiError } from "@/lib/error";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import { FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

export default function RegisterEventPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    pointCode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const events = await EventService.getAllEvents({
          status: EventStatus.PUBLISHED,
        });
        setEvents(events);
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
  }, []);

  // Filter events based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(
        (event) =>
          event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.eventDescription
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchTerm, events]);

  // Handle event selection
  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setShowModal(true);
    setError(null);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsSubmitting(true);
    setError(null);

    try {
      setIsLoading(true);
      await PocService.registerPocUser({
        eventCode: selectedEvent.eventCode,
        pointCode: formData.pointCode,
      });

      setSuccess(
        `Successfully registered as a POC for ${selectedEvent.eventName}`
      );

      // Reset form after successful submission
      setTimeout(() => {
        setShowModal(false);
        setSelectedEvent(null);
        setFormData({
          pointCode: "",
        });
        setSuccess(null);
      }, 3000);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to register. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setError(null);
    setSuccess(null);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Become a Point of Check-in
      </h1>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search events by name..."
            className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute right-4 top-4 h-6 w-6 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event.eventId}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => handleEventSelect(event)}
          >
            <div className="relative h-48">
              <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                {event.images && event.images.length > 0 ? (
                  <img
                    src={event.images[0]}
                    alt={event.eventName}
                    width={400}
                    height={200}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ) : (
                  <span className="text-gray-500">No image available</span>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {event.eventName}
                </h3>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {event.eventStatus}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {new Date(event.startTime).toLocaleDateString()} -{" "}
                {new Date(event.endTime).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {event.venueName}, {event.venueAddress}
              </p>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {event.eventDescription}
              </p>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">
              No events found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <IoClose className="h-6 w-6" />
            </button>

            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Register as POC for {selectedEvent?.eventName}
              </h2>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="pointCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Point Code
                  </label>
                  <input
                    type="text"
                    id="pointCode"
                    name="pointCode"
                    placeholder="Enter a unique point code"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.pointCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Registering..." : "Register"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
