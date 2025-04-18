"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateEventRequest, Event } from "@/types/event";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useEventStore } from "@/store/eventStore";
import { useShallow } from "zustand/shallow";
import { PocService } from "@/services/poc.service";
import { CreatePocRequest, Poc, UpdatePocRequest } from "@/types/poc";
import EventAnalysis from "@/components/admin/event/eventAnalysis";
import { EventStatus } from "@/types/event";

// Event update validation schema - similar to create but all fields optional
const eventSchema = z.object({
  eventName: z.string().min(3, "Event name must be at least 3 characters"),
  eventCode: z.string().min(3, "Event code must be at least 3 characters"),
  startTime: z.string().min(1, "Start date is required"),
  endTime: z.string().min(1, "End date is required"),
  eventDescription: z.string().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  capacity: z.number().optional(),
  eventType: z.string().optional(),
  termsConditions: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [checkInPoints, setCheckInPoints] = useState<Poc[]>([]);
  const [newCheckinPoints, setNewCheckInPoints] = useState<CreatePocRequest[]>(
    []
  );
  const [removedCheckinPoint, setRemovedCheckinPoint] = useState<Poc[]>([]);

  const { updateEvent, getEventByCode } = useEventStore(
    useShallow((state) => ({
      updateEvent: state.updateEvent,
      getEventByCode: state.getEventByCode,
    }))
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  // Fetch event details by event code
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await getEventByCode(params.eventCode as string);
        setEvent(eventData);

        reset({
          eventName: eventData.eventName,
          eventCode: eventData.eventCode,
          startTime: new Date(eventData.startTime).toISOString().slice(0, 16),
          endTime: new Date(eventData.endTime).toISOString().slice(0, 16),
          eventDescription: eventData.eventDescription || "",
          venueName: eventData.venueName || "",
          venueAddress: eventData.venueAddress || "",
          capacity: eventData.capacity || undefined,
          eventType: eventData.eventType || "",
          termsConditions: eventData.termsConditions || "",
        });
      } catch (error) {
        console.error("Error fetching event:", error);
        alert("Failed to load event details. Please try again.");
        router.push("/admin/events");
      }
    };

    fetchEvent();
  }, [params.eventCode, getEventByCode, reset, router]);

  // Fetch check-in points for the event
  useEffect(() => {
    const fetchCheckInPoints = async () => {
      try {
        const pocList = await PocService.getAllPocs(params.eventCode as string);
        setCheckInPoints(pocList);
      } catch (error) {
        console.error("Error fetching POCs:", error);
        alert("Failed to load POCs. Please try again.");
      }
    };
    fetchCheckInPoints();
  }, [params.eventCode]);

  const removeCheckInPoint = (index: number) => {
    setRemovedCheckinPoint([...removedCheckinPoint, checkInPoints[index]]);
    setCheckInPoints(checkInPoints.filter((_, i) => i !== index));
  };
  const updateCheckInPoint = (
    index: number,
    field: keyof UpdatePocRequest,
    value: string
  ) => {
    const newPoints = [...checkInPoints];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setCheckInPoints(newPoints);
  };

  // Helper function to update new check-in points
  const addCheckInPoint = () => {
    const newPoint: CreatePocRequest = {
      pointCode: "",
      pointName: "",
    };
    setNewCheckInPoints([...newCheckinPoints, newPoint]);
  };
  const removeNewCheckInPoint = (index: number) => {
    setNewCheckInPoints(newCheckinPoints.filter((_, i) => i !== index));
  };
  const updateNewCheckInPoint = (
    index: number,
    field: keyof UpdatePocRequest,
    value: string
  ) => {
    const newPoints = [...newCheckinPoints];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setNewCheckInPoints(newPoints);
  };

  // Function to handle form submission
  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      // Update event
      const eventData: CreateEventRequest = { ...data };
      await updateEvent(params.eventCode as string, eventData);

      // Handle POC updates if needed
      for (const point of checkInPoints) {
        try {
          await PocService.updatePoc(point.pocId, {
            pointCode: point.pointCode,
            pointName: point.pointName,
          });
        } catch (pocError) {
          console.error(`Failed to update POC: ${point.pointCode}`, pocError);
          alert(`Failed to update POC: ${point.pointCode}. Please try again.`);
        }
      }

      for (const point of newCheckinPoints) {
        try {
          if (!point.pointCode || !point.pointName) {
            alert("POC code and name are required.");
            return;
          }
          await PocService.createPoc(params.eventCode as string, point);
        } catch (pocError) {
          console.error(`Failed to create POC: ${point.pointCode}`, pocError);
          alert(`Failed to create POC: ${point.pointCode}. Please try again.`);
        }
      }

      for (const point of removedCheckinPoint) {
        try {
          await PocService.removePoc(point.pocId);
        } catch (pocError) {
          console.error(`Failed to remove POC: ${point.pointCode}`, pocError);
          alert(`Failed to remove POC: ${point.pointCode}. Please try again.`);
        }
      }

      router.push("/admin/events");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update event. Please try again.";
      console.error("Update event error:", error);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Edit Event: {event.eventName}
          <span className="ml-2">
            {event.eventStatus == EventStatus.PUBLISHED ? (
              <span className="text-green-500">(Editable)</span>
            ) : (
              <span className="text-red-500">(Viewonly)</span>
            )}
          </span>
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Event Name"
              type="text"
              disabled={event.eventStatus != EventStatus.PUBLISHED}
              {...register("eventName")}
              error={errors.eventName?.message}
            />

            <Input
              label="Event Code"
              type="text"
              {...register("eventCode")}
              error={errors.eventCode?.message}
              disabled
            />

            <Input
              label="Start Date"
              type="datetime-local"
              disabled={event.eventStatus != EventStatus.PUBLISHED}
              {...register("startTime")}
              error={errors.startTime?.message}
            />

            <Input
              label="End Date"
              type="datetime-local"
              disabled={event.eventStatus != EventStatus.PUBLISHED}
              {...register("endTime")}
              error={errors.endTime?.message}
            />

            <Input
              label="Venue Name"
              type="text"
              disabled={event.eventStatus != EventStatus.PUBLISHED}
              {...register("venueName")}
              error={errors.venueName?.message}
            />

            <Input
              label="Venue Address"
              type="text"
              disabled={event.eventStatus != EventStatus.PUBLISHED}
              {...register("venueAddress")}
              error={errors.venueAddress?.message}
            />

            <Input
              label="Capacity"
              type="number"
              disabled={event.eventStatus != EventStatus.PUBLISHED}
              {...register("capacity", { valueAsNumber: true })}
              error={errors.capacity?.message}
            />

            <Input
              label="Event Type"
              type="text"
              disabled={event.eventStatus != EventStatus.PUBLISHED}
              {...register("eventType")}
              error={errors.eventType?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Description
            </label>
            <textarea
              {...register("eventDescription")}
              disabled={event.eventStatus != EventStatus.PUBLISHED}
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms and Conditions
            </label>
            <textarea
              {...register("termsConditions")}
              disabled={event.eventStatus != EventStatus.PUBLISHED}
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Check-in Points
              </h2>
              {event.eventStatus == EventStatus.PUBLISHED && (
                <button
                  type="button"
                  onClick={addCheckInPoint}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Point
                </button>
              )}
            </div>

            <div className="space-y-4">
              {checkInPoints.map((point, index) => (
                <div key={point.pocId} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Check-in Point {index + 1}
                    </h3>
                    {checkInPoints.length > 1 && event.eventStatus == EventStatus.PUBLISHED && (
                      <button
                        type="button"
                        onClick={() => removeCheckInPoint(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      type="text"
                      disabled={event.eventStatus != EventStatus.PUBLISHED}
                      value={point.pointName}
                      onChange={(e) =>
                        updateCheckInPoint(index, "pointName", e.target.value)
                      }
                      placeholder="Main Entrance"
                    />

                    <Input
                      label="POC Code"
                      type="text"
                      disabled={event.eventStatus != EventStatus.PUBLISHED}
                      value={point.pointCode}
                      onChange={(e) =>
                        updateCheckInPoint(index, "pointCode", e.target.value)
                      }
                      placeholder="POC001"
                    />
                  </div>
                </div>
              ))}

              {newCheckinPoints.map((point, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Check-in Point {index + 1}
                    </h3>
                    {newCheckinPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeNewCheckInPoint(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      type="text"
                      value={point.pointName}
                      onChange={(e) =>
                        updateNewCheckInPoint(
                          index,
                          "pointName",
                          e.target.value
                        )
                      }
                      placeholder="Main Entrance"
                    />

                    <Input
                      label="POC Code"
                      type="text"
                      value={point.pointCode}
                      onChange={(e) =>
                        updateNewCheckInPoint(
                          index,
                          "pointCode",
                          e.target.value
                        )
                      }
                      placeholder="POC001"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {event.eventStatus == EventStatus.PUBLISHED && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push("/admin/events")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <Button type="submit" isLoading={isLoading}>
                Update Event
              </Button>
            </div>
          )}
        </form>
      </div>
      <div className="mt-8">
        <EventAnalysis eventCode={params.eventCode as string} />
      </div>
    </div>
  );
}
