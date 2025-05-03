"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useEventStore } from "@/store/eventStore";
import { useShallow } from "zustand/shallow";
import { useFloorPlanStore } from "@/store/floorPlanStore";
import { PocService } from "@/services/poc.service";
import Image from "next/image";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

export default function EventDetailsPage() {
  const params = useParams();
  const eventCode = useSearchParams().get("eventCode") as string;
  const [floorPlanImageUrl, setFloorPlanImageUrl] = useState<string | null>(
    null
  );
  const [markedPoints, setMarkedPoints] = useState<{
    [key: string]: { x: number; y: number };
  }>({});
  const { selectedEvent, setSelectedEvent, getEventByCode } = useEventStore(
    useShallow((state) => ({
      selectedEvent: state.selectedEvent,
      setSelectedEvent: state.setSelectedEvent,
      getEventByCode: state.getEventByCode,
    }))
  );
  const { floorPlanImage, getFloorPlanImage } = useFloorPlanStore(
    useShallow((state) => ({
      floorPlanImage: state.floorPlanImage,
      getFloorPlanImage: state.getFloorPlanImage,
    }))
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        if (!selectedEvent) {
          const event = await getEventByCode(params.eventCode as string);
          setSelectedEvent(event);
        }
      } catch (error) {
        setError("Failed to fetch event details");
        console.error("Error fetching event:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [params.eventCode, getEventByCode, setSelectedEvent]);

  useEffect(() => {
    let imageUrl: string;

    const getFloorPlanImageUrl = async () => {
      try {
        if (!floorPlanImage) {
          await getFloorPlanImage(eventCode);
        }
        const blob = new Blob([floorPlanImage as Blob], { type: "image/jpeg" });
        imageUrl = URL.createObjectURL(blob);
        setFloorPlanImageUrl(imageUrl);
      } catch (error) {
        console.error("Error loading floor plan:", error);
        setError("Failed to load floor plan image");
      }
    };

    getFloorPlanImageUrl();

    // Cleanup function to revoke the Blob URL
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [floorPlanImage, getFloorPlanImage, eventCode]); // Add dependencies

  useEffect(() => {
    const getPocLocations = async () => {
      try {
        const pocLocationsArray = await PocService.getPocLocations(eventCode);
        const pocLocationsObject = pocLocationsArray.reduce(
          (acc, location) => {
            acc[location.pocId] = {
              x: location.xCoordinate,
              y: location.yCoordinate,
            };
            return acc;
          },
          {} as {
            [key: string]: {
              x: number;
              y: number;
            };
          }
        );
        setMarkedPoints(pocLocationsObject);
      } catch (error) {
        console.error("Error loading POC locations:", error);
        setError("Failed to load POC locations. Please try again.");
      }
    };
    getPocLocations();
  }, [params.eventCode, setMarkedPoints, eventCode]); // Add dependencies

  if (isLoading || !selectedEvent) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error || "Event not found"} />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Event Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedEvent.eventName}
          </h1>
          <div className="flex items-center text-gray-600 text-sm">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {new Date(selectedEvent.startTime).toLocaleDateString()}{" "}
              {new Date(selectedEvent.startTime).toLocaleTimeString()} -
              {new Date(selectedEvent.endTime).toLocaleDateString()}{" "}
              {new Date(selectedEvent.endTime).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-6 space-y-6">
          <div className="md:col-span-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              {floorPlanImageUrl ? (
                <div className="relative">
                  <Image
                    src={floorPlanImageUrl}
                    alt="Floor plan"
                    width={800}
                    height={600}
                    className="w-full rounded-md cursor-crosshair"
                  />
                  {/* Render marked points */}
                  {Object.entries(markedPoints).map(([pocId, pos]) => {
                    // const point = pocList.find((p) => p.pocId === pocId);
                    return (
                      <div
                        key={pocId}
                        className="absolute w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                        }}
                      >
                        <div className="absolute left-6 top-0 bg-white px-2 py-1 rounded shadow text-sm">
                          {/* {point?.pointName} */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload floor plan
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Venue Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Venue</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">
                {selectedEvent.venueName}
              </p>
              <p className="text-gray-600">{selectedEvent.venueAddress}</p>
            </div>
          </div>

          {/* Event Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              About the Event
            </h2>
            <p className="text-gray-600 whitespace-pre-line">
              {selectedEvent.eventDescription}
            </p>
          </div>

          {/* Event Type & Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Event Type
              </h2>
              <p className="text-gray-600">
                {selectedEvent.eventType || "Not specified"}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Capacity
              </h2>
              <p className="text-gray-600">
                {selectedEvent.capacity || "Unlimited"}
              </p>
            </div>
          </div>

          {/* Terms & Conditions */}
          {selectedEvent.termsConditions && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Terms & Conditions
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 whitespace-pre-line">
                  {selectedEvent.termsConditions}
                </p>
              </div>
            </div>
          )}

          {/* Event Status */}
          <div className="mt-6">
            <div
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor:
                  selectedEvent.eventStatus === "active"
                    ? "rgb(220 252 231)"
                    : selectedEvent.eventStatus === "published"
                    ? "rgb(254 249 195)"
                    : selectedEvent.eventStatus === "completed"
                    ? "rgb(219 234 254)"
                    : "rgb(254 226 226)",
                color:
                  selectedEvent.eventStatus === "active"
                    ? "rgb(22 163 74)"
                    : selectedEvent.eventStatus === "published"
                    ? "rgb(161 98 7)"
                    : selectedEvent.eventStatus === "completed"
                    ? "rgb(29 78 216)"
                    : "rgb(220 38 38)",
              }}
            >
              {selectedEvent.eventStatus.charAt(0).toUpperCase() +
                selectedEvent.eventStatus.slice(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
