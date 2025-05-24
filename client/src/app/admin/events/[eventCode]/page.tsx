"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AccessType, UpdateEventData } from "@/types/event";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useEventStore } from "@/store/admin/eventStore";
import { useShallow } from "zustand/shallow";
import { PocService } from "@/services/admin/poc.service";
import { CreatePocRequest, Poc, UpdatePocRequest } from "@/types/poc";
import EventAnalysis from "@/components/admin/event/EventAnalysis";
import { EventStatus } from "@/types/event";
import Link from "next/link";
import { usePocStore } from "@/store/admin/pocStore";
import { useFloorPlanStore } from "@/store/admin/floorPlanStore";
import DeleteEventValidation from "@/components/admin/event/DeleteEventValidation";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import EventImages from "@/components/admin/event/EventImages";
import { EventService } from "@/services/admin/event.service";
import { ApiError } from "@/lib/error";

// Event update validation schema - similar to create but all fields optional
const eventSchema = z.object({
  eventName: z.string().optional(),
  eventCode: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  eventDescription: z.string().optional(),
  termsConditions: z.string().optional(),
  capacity: z.number().optional(),
  accessType: z.nativeEnum(AccessType).optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  images: z.array(z.string()).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCheckinPoints, setNewCheckInPoints] = useState<CreatePocRequest[]>(
    []
  );
  const [removedCheckinPoint, setRemovedCheckinPoint] = useState<Poc[]>([]);
  const [deleteEvent, setDeleteEvent] = useState<boolean>(false);
  const [eventImages, setEventImages] = useState<File[]>([]);
  const { selectedEvent, updateEvent, getEventByCode, setSelectedEvent } =
    useEventStore(
      useShallow((state) => ({
        selectedEvent: state.selectedEvent,
        setSelectedEvent: state.setSelectedEvent,
        updateEvent: state.updateEvent,
        getEventByCode: state.getEventByCode,
      }))
    );

  const { pocList, getAllPocs, setPocList } = usePocStore(
    useShallow((state) => ({
      pocList: state.pocList,
      setPocList: state.setPocList,
      getAllPocs: state.getAllPocs,
    }))
  );

  const { floorPlanImageUrl, getFloorPlanImage } = useFloorPlanStore(
    useShallow((state) => ({
      floorPlanImageUrl: state.floorPlanImageUrl,
      getFloorPlanImage: state.getFloorPlanImage,
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
        setIsLoading(true);

        if (!selectedEvent) {
          await getEventByCode(params.eventCode as string);
        }

        if (selectedEvent) {
          reset({
            eventName: selectedEvent.eventName,
            eventCode: selectedEvent.eventCode,
            startTime: new Date(selectedEvent.startTime)
              .toISOString()
              .slice(0, 16),
            endTime: new Date(selectedEvent.endTime).toISOString().slice(0, 16),
            eventDescription: selectedEvent.eventDescription || "",
            venueName: selectedEvent.venueName || "",
            venueAddress: selectedEvent.venueAddress || "",
            capacity: selectedEvent.capacity || undefined,
            termsConditions: selectedEvent.termsConditions || "",
            accessType: selectedEvent.accessType || AccessType.PUBLIC,
          });
        }

        setIsLoading(false);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Failed to fetch event details. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [
    params.eventCode,
    getEventByCode,
    reset,
    router,
    setSelectedEvent,
    selectedEvent,
  ]);

  // Get floor plan image
  useEffect(() => {
    const getFloorPlanImageUrl = async () => {
      try {
        await getFloorPlanImage(params.eventCode as string);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Failed to load floor plan image");
        }
      }
    };

    getFloorPlanImageUrl();
  }, [params.eventCode, getFloorPlanImage]);

  useEffect(() => {
    const getPocs = async () => {
      try {
        await getAllPocs(params.eventCode as string);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Failed to load POCs. Please try again.");
        }
      }
    };
    getPocs();
  }, [params.eventCode, getAllPocs]);

  const removeCheckInPoint = (index: number) => {
    setRemovedCheckinPoint([...removedCheckinPoint, pocList[index]]);
    const newPocList = [...pocList];
    newPocList.splice(index, 1);
    setPocList(newPocList);
  };
  const updateCheckInPoint = (
    index: number,
    field: keyof UpdatePocRequest,
    value: string
  ) => {
    const newPoints = [...pocList];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setPocList(newPoints);
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

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      // Update event
      await updateEvent(params.eventCode as string, data as UpdateEventData);

      // Handle POC updates if needed
      for (const point of pocList) {
        await PocService.updatePoc(point.pocId, {
          pointCode: point.pointCode,
          pointName: point.pointName,
        });
      }

      for (const point of newCheckinPoints) {
        if (!point.pointCode || !point.pointName) {
          alert("POC code and name are required.");
          return;
        }
        await PocService.createPoc(params.eventCode as string, point);
      }

      for (const point of removedCheckinPoint) {
        await PocService.removePoc(point.pocId);
      }

      if (eventImages.length > 0) {
        await EventService.uploadEventImages(
          params.eventCode as string,
          eventImages
        );
      }

      router.push("/admin/events");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to update event. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !selectedEvent) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/admin/events" />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl relative">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Edit Event: {selectedEvent.eventName}
          <span className="ml-2">
            {selectedEvent.eventStatus == EventStatus.PUBLISHED ? (
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
              disabled={selectedEvent?.eventStatus != EventStatus.PUBLISHED}
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
              disabled={selectedEvent.eventStatus != EventStatus.PUBLISHED}
              {...register("startTime")}
              error={errors.startTime?.message}
            />

            <Input
              label="End Date"
              type="datetime-local"
              disabled={selectedEvent.eventStatus != EventStatus.PUBLISHED}
              {...register("endTime")}
              error={errors.endTime?.message}
            />

            <Input
              label="Venue Name"
              type="text"
              disabled={selectedEvent.eventStatus != EventStatus.PUBLISHED}
              {...register("venueName")}
              error={errors.venueName?.message}
            />

            <Input
              label="Venue Address"
              type="text"
              disabled={selectedEvent.eventStatus != EventStatus.PUBLISHED}
              {...register("venueAddress")}
              error={errors.venueAddress?.message}
            />

            <Input
              label="Capacity"
              type="number"
              disabled={selectedEvent.eventStatus != EventStatus.PUBLISHED}
              {...register("capacity", { valueAsNumber: true })}
              error={errors.capacity?.message}
            />

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 ">
                Access Type
              </label>
              <select
                {...register("accessType")}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value={AccessType.PUBLIC}>Public</option>
                <option value={AccessType.PRIVATE}>Private</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Description
            </label>
            <textarea
              {...register("eventDescription")}
              disabled={selectedEvent.eventStatus != EventStatus.PUBLISHED}
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
              disabled={selectedEvent.eventStatus != EventStatus.PUBLISHED}
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <EventImages
            event={selectedEvent}
            onImagesChange={(images) => {
              setEventImages(images);
            }}
          />

          {/* Floor Plan Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Floor Plan</h2>
              {selectedEvent.eventStatus === EventStatus.PUBLISHED && (
                <Link
                  href={`/admin/events/${params.eventCode}/floor-plan`}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Manage Floor Plan
                </Link>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              {floorPlanImageUrl ? (
                <div className="relative">
                  <img
                    src={floorPlanImageUrl}
                    alt="Floor plan"
                    className="max-h-[300px] w-auto object-contain rounded-md"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500">No floor plan uploaded</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Check-in Points
              </h2>
              {selectedEvent.eventStatus == EventStatus.PUBLISHED && (
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
              {pocList.map((point, index) => (
                <div key={point.pocId} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Check-in Point {index + 1}
                      <Link
                        href={`/admin/events/${params.eventCode}/poc/${point.pointCode}`}
                        className="text-blue-600 ml-2"
                      >
                        View details
                      </Link>
                    </h3>
                    {pocList.length > 1 &&
                      selectedEvent.eventStatus == EventStatus.PUBLISHED && (
                        <button
                          type="button"
                          onClick={() => removeCheckInPoint(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Name"
                      type="text"
                      disabled={
                        selectedEvent.eventStatus != EventStatus.PUBLISHED
                      }
                      value={point.pointName}
                      onChange={(e) =>
                        updateCheckInPoint(index, "pointName", e.target.value)
                      }
                      placeholder="Main Entrance"
                    />

                    <Input
                      label="POC Code"
                      type="text"
                      disabled={
                        selectedEvent.eventStatus != EventStatus.PUBLISHED
                      }
                      value={point.pointCode}
                      onChange={(e) =>
                        updateCheckInPoint(index, "pointCode", e.target.value)
                      }
                      placeholder="POC001"
                    />
                    <Input
                      label="Location"
                      type="text"
                      // value={point.location}
                      // onChange={(e) =>
                      //   updateCheckInPoint(index, "location", e.target.value)
                      // }
                      placeholder="Main Entrance"
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                    <Input
                      label="Location"
                      type="text"
                      // value={point.location}
                      // onChange={(e) =>
                      //   updateNewCheckInPoint(
                      //     index,
                      //     "location",
                      //     e.target.value
                      //   )
                      // }
                      placeholder="Main Entrance"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedEvent.eventStatus == EventStatus.PUBLISHED && (
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
      {selectedEvent.eventStatus === EventStatus.PUBLISHED && (
        <div className="mt-9">
          <button
            className="border-red-500 border-2 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-md w-full"
            onClick={() => setDeleteEvent(true)}
          >
            Delete Event
          </button>
        </div>
      )}

      {deleteEvent && (
        <DeleteEventValidation
          isOpen={deleteEvent}
          eventCode={params.eventCode as string}
          onClose={() => setDeleteEvent(false)}
        />
      )}

      {selectedEvent.eventStatus !== EventStatus.PUBLISHED && (
        <div className="mt-8">
          <EventAnalysis eventCode={params.eventCode as string} />
        </div>
      )}
    </div>
  );
}
