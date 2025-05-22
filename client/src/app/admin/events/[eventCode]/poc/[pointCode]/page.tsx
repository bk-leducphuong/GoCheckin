"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PocService } from "@/services/poc.service";
import { Poc, PocManager, UpdatePocRequest } from "@/types/poc";
import { useEventStore } from "@/store/eventStore";
import { EventStatus } from "@/types/event";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { ApiError } from "@/lib/error";

// POC update validation schema
const pocSchema = z.object({
  pointName: z.string().min(3, "Point name must be at least 3 characters"),
  pointCode: z.string().min(3, "Point code must be at least 3 characters"),
  locationDescription: z.string().optional(),
  floorLevel: z.string().optional(),
  capacity: z.string().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  status: z.string().optional(),
});

type PocFormData = z.infer<typeof pocSchema>;

export default function PocDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [poc, setPoc] = useState<Poc | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pocManager, setPocManager] = useState<PocManager | null>(null);
  const selectedEvent = useEventStore((state) => state.selectedEvent);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PocFormData>({
    resolver: zodResolver(pocSchema),
  });

  // Fetch POC details
  useEffect(() => {
    const fetchPoc = async () => {
      try {
        setIsLoading(true);

        const currentPoc = await PocService.getPoc(
          params.pointCode as string,
          params.eventCode as string
        );
        if (currentPoc) {
          setPoc(currentPoc);
          reset({
            pointName: currentPoc.pointName,
            pointCode: currentPoc.pointCode,
            locationDescription: currentPoc.locationDescription || "",
            floorLevel: currentPoc.floorLevel || "",
            capacity: currentPoc.capacity || "",
            openTime: currentPoc.openTime || "",
            closeTime: currentPoc.closeTime || "",
            status: currentPoc.status || "",
          });
        } else {
          setError("POC not found");
        }
        setIsLoading(false);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Failed to fetch POC details. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoc();
  }, [params.eventCode, params.pointCode, reset, router]);

  // Get POC manager information
  useEffect(() => {
    const fetchPocManager = async () => {
      try {
        if (!poc || !poc.userId) return;

        setIsLoading(true);

        const pocManager = await PocService.getPocManager(poc.userId);
        if (pocManager) {
          setPocManager(pocManager);
        }
        setIsLoading(false);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Failed to fetch POC manager. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPocManager();
  }, [poc, params.eventCode, params.pointCode, reset, router]);

  const onSubmit = async (data: PocFormData) => {
    setIsLoading(true);
    if (selectedEvent?.eventStatus !== EventStatus.PUBLISHED) {
      alert("You cannot edit POC details when the event is not published.");
      setIsLoading(false);
      return;
    }

    try {
      // Update POC
      const pocData: UpdatePocRequest = { ...data };
      await PocService.updatePoc(poc?.pocId as string, pocData);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to update POC. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !poc) {
    return <Error message={error || "POC not found"} redirectTo="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            POC Details: {poc.pointName}
          </h1>
          {selectedEvent?.eventStatus === EventStatus.PUBLISHED && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Point Name"
              type="text"
              disabled={!isEditing}
              {...register("pointName")}
              error={errors.pointName?.message}
            />

            <Input
              label="Point Code"
              type="text"
              disabled={true}
              {...register("pointCode")}
              error={errors.pointCode?.message}
            />

            <Input
              label="Location Description"
              type="text"
              disabled={!isEditing}
              {...register("locationDescription")}
              error={errors.locationDescription?.message}
            />

            <Input
              label="Floor Level"
              type="text"
              disabled={!isEditing}
              {...register("floorLevel")}
              error={errors.floorLevel?.message}
            />

            <Input
              label="Capacity"
              type="number"
              disabled={!isEditing}
              {...register("capacity")}
              error={errors.capacity?.message}
            />

            <Input
              label="Status"
              type="text"
              disabled={!isEditing}
              {...register("status")}
              error={errors.status?.message}
            />

            <Input
              label="Open Time"
              type="time"
              disabled={!isEditing}
              {...register("openTime")}
              error={errors.openTime?.message}
            />

            <Input
              label="Close Time"
              type="time"
              disabled={!isEditing}
              {...register("closeTime")}
              error={errors.closeTime?.message}
            />
          </div>

          {/* POC Manager Information */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              POC Manager Information
            </h2>
            {pocManager ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-semibold">
                    {poc.userId?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      {pocManager?.username}
                    </h3>
                    <p className="text-sm text-gray-500">{pocManager?.email}</p>
                    <p className="text-sm text-gray-500">
                      Registered on{" "}
                      {new Date(pocManager?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-orange-500">
                This POC is not assigned to any manager.
              </div>
            )}
          </div>

          {/* Activity History */}
          {pocManager && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {[1, 2, 3].map((item) => (
                    <li key={item}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            Activity {item}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {item} hour{item === 1 ? "" : "s"} ago
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              Activity description here
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end space-x-4">
              <Button type="submit" isLoading={isLoading}>
                Update POC
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
