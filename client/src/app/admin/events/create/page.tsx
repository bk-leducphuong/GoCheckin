"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useEventStore } from "@/store/eventStore";
import { useShallow } from "zustand/shallow";
import { PocService } from "@/services/poc.service";
import { CreatePocRequest } from "@/types/poc";
import { FloorPlanService } from "@/services/floor-plan.service";
import { EventService } from "@/services/event.service";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { compressImage } from "@/utils/imageCompression";

// Event creation validation schema
const eventSchema = z.object({
  eventName: z.string().min(3, "Event name must be at least 3 characters"),
  eventCode: z.string().min(3, "Event code must be at least 3 characters"),
  startTime: z.string().min(1, "Start date is required"),
  endTime: z.string().min(1, "End date is required"),
  eventDescription: z.string().optional(),
  termsConditions: z.string().optional(),
  capacity: z.number().optional(),
  venueName: z.string().min(1, "Venue name is required"),
  venueAddress: z.string().min(1, "Venue address is required"),
  images: z.array(z.string()).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const uploadFloorPlan = useRef<HTMLInputElement>(null);
  const uploadEventImages = useRef<HTMLInputElement>(null);
  const [eventImageUrls, setEventImageUrls] = useState<string[]>([]);
  const [eventImages, setEventImages] = useState<File[]>([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInPoints, setCheckInPoints] = useState<CreatePocRequest[]>([
    { pointCode: "", pointName: "" },
  ]);
  const [floorPlanImageUrl, setFloorPlanImageUrl] = useState<string | null>(
    null
  );
  const [floorPlanImage, setFloorPlanImage] = useState<File | null>(null);

  const { createEvent } = useEventStore(
    useShallow((state) => ({
      createEvent: state.createEvent,
    }))
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const addCheckInPoint = () => {
    setCheckInPoints([...checkInPoints, { pointName: "", pointCode: "" }]);
  };

  const removeCheckInPoint = (index: number) => {
    setCheckInPoints(checkInPoints.filter((_, i) => i !== index));
  };

  const updateCheckInPoint = (
    index: number,
    field: keyof CreatePocRequest,
    value: string
  ) => {
    const newPoints = [...checkInPoints];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setCheckInPoints(newPoints);
  };

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      const newEvent = await createEvent(data);

      if (eventImages.length > 0) {
        await EventService.uploadEventImages(newEvent.eventCode, eventImages);
      }

      if (floorPlanImage) {
        const uploadedFloorPlanImage =
          await FloorPlanService.uploadFloorPlanImage(
            newEvent.eventCode,
            floorPlanImage
          );
        await FloorPlanService.saveFloorPlan({
          eventCode: newEvent.eventCode,
          floorPlanImageUrl: uploadedFloorPlanImage,
        });
      }

      for (const point of checkInPoints) {
        if (point.pointCode && point.pointName) {
          await PocService.createPoc(newEvent.eventCode, point);
        }
      }

      setIsLoading(false);
      router.push("/admin/events");
    } catch (error) {
      setError("Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (uploadFloorPlan.current) {
      uploadFloorPlan.current.click();
    }
  };

  const handleFloorPlanUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFloorPlanImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFloorPlanImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEventImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    // Add file size validation
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Some files exceed the 5MB limit");
      return;
    }

    // Add file type validation
    const invalidFiles = files.filter((file) => !file.type.match(/^image\//));
    if (invalidFiles.length > 0) {
      alert("Only image files are allowed");
      return;
    }

    if (eventImageUrls.length + files.length > 3) {
      alert("You can only upload up to 3 images");
      return;
    }

    const compressedFiles = await Promise.all(
      files.map((file) => compressImage(file, 2)) // Compress to 2MB max
    );

    setEventImages((prevImages) => [...prevImages, ...compressedFiles]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImageUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEventImage = (index: number) => {
    setEventImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEventImagesClick = () => {
    if (uploadEventImages.current) {
      uploadEventImages.current.click();
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create New Event
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Event Name"
              type="text"
              {...register("eventName")}
              error={errors.eventName?.message}
              placeholder="Tech Conference 2024"
            />

            <Input
              label="Event Code"
              type="text"
              {...register("eventCode")}
              error={errors.eventCode?.message}
              placeholder="TC2024"
            />

            <Input
              label="Start Date"
              type="datetime-local"
              {...register("startTime")}
              error={errors.startTime?.message}
            />

            <Input
              label="End Date"
              type="datetime-local"
              {...register("endTime")}
              error={errors.endTime?.message}
            />

            <Input
              label="Venue Name"
              type="text"
              {...register("venueName")}
              error={errors.venueName?.message}
              placeholder="Event Center"
            />

            <Input
              label="Venue Address"
              type="text"
              {...register("venueAddress")}
              error={errors.venueAddress?.message}
              placeholder="123 Main Street, Anytown, USA"
            />
            <Input
              label="Capacity"
              type="number"
              min={0}
              {...register("capacity", { valueAsNumber: true })}
              error={errors.capacity?.message}
              placeholder="100"
            ></Input>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register("eventDescription")}
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Add any additional notes about the event"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms and Conditions
            </label>
            <textarea
              {...register("termsConditions")}
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Add any terms and conditions for the event"
            />
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Event Floor Plan
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              Upload a floor plan image for the event.
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={uploadFloorPlan}
              onChange={handleFloorPlanUpload}
            />
            {floorPlanImageUrl ? (
              <div className="mt-2 relative">
                <Image
                  src={floorPlanImageUrl}
                  alt="Floor plan preview"
                  width={600}
                  height={300}
                  className="max-h-[300px] object-contain rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setFloorPlanImageUrl(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="mt-2 w-30 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleUploadClick}
              >
                Upload
              </button>
            )}
          </div>

          {/* Upload event images section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">Event Images</h2>
            <p className="text-sm text-gray-500 mb-2">
              Upload up to 3 images for the event (max 5MB each, will be stored
              in S3).
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={uploadEventImages}
              onChange={handleEventImagesUpload}
            />

            <div className="mt-2 space-y-4">
              <div className="flex flex-wrap gap-4">
                {eventImageUrls.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={image}
                      alt={`Event image ${index + 1}`}
                      width={200}
                      height={150}
                      className="rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeEventImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 focus:outline-none"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {eventImageUrls.length < 3 && (
                <button
                  type="button"
                  className="w-30 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleEventImagesClick}
                >
                  Upload Images
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Check-in Points
              </h2>
              <button
                type="button"
                onClick={addCheckInPoint}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Point
              </button>
            </div>

            <div className="space-y-4">
              {checkInPoints.map((point, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Check-in Point {index + 1}
                    </h3>
                    {checkInPoints.length > 1 && (
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
                      value={point.pointName}
                      onChange={(e) =>
                        updateCheckInPoint(index, "pointName", e.target.value)
                      }
                      placeholder="Main Entrance"
                    />

                    <Input
                      label="Location"
                      type="text"
                      // value={point.}
                      // onChange={(e) =>
                      //   updateCheckInPoint(index, "", e.target.value)
                      // }
                      placeholder="Ground Floor"
                    />

                    <Input
                      label="POC ID"
                      type="text"
                      value={point.pointCode}
                      onChange={(e) =>
                        updateCheckInPoint(index, "pointCode", e.target.value)
                      }
                      placeholder="POC001"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/admin/events")}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <Button type="submit" isLoading={isLoading}>
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
