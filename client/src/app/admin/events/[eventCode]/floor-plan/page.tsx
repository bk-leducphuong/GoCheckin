"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useEventStore } from "@/store/admin/eventStore";
import { useFloorPlanStore } from "@/store/admin/floorPlanStore";
import { usePocStore } from "@/store/admin/pocStore";
import { useShallow } from "zustand/shallow";
import { PocService } from "@/services/admin/poc.service";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { FloorPlanService } from "@/services/admin/floor-plan.service";
import { ApiError } from "@/lib/error";
import { validateImages } from "@/utils/imageValidation";

export default function FloorPlanPage() {
  const params = useParams();
  const uploadFloorPlan = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newFloorPlanImage, setNewFloorPlanImage] = useState<File | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [markedPoints, setMarkedPoints] = useState<{
    [key: string]: { x: number; y: number };
  }>({});
  const [isFloorPlanChanged, setIsFloorPlanChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { getEventByCode, setSelectedEvent } = useEventStore(
    useShallow((state) => ({
      selectedEvent: state.selectedEvent,
      getEventByCode: state.getEventByCode,
      setSelectedEvent: state.setSelectedEvent,
    }))
  );

  const { floorPlanImageUrl, getFloorPlanImage, setFloorPlanImageUrl } =
    useFloorPlanStore(
      useShallow((state) => ({
        floorPlanImageUrl: state.floorPlanImageUrl,
        getFloorPlanImage: state.getFloorPlanImage,
        setFloorPlanImageUrl: state.setFloorPlanImageUrl,
      }))
    );

  const { pocList, getAllPocs } = usePocStore(
    useShallow((state) => ({
      pocList: state.pocList,
      eventCodeFromPoc: state.eventCode,
      getAllPocs: state.getAllPocs,
    }))
  );

  // Get event
  useEffect(() => {
    const getEvent = async () => {
      try {
        await getEventByCode(params.eventCode as string);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Failed to load floor plan data. Please try again.");
        }
      }
    };
    getEvent();
  }, [params.eventCode, getEventByCode, setSelectedEvent]); // Add dependencies

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
  }, [params.eventCode, getAllPocs]); // Add dependencies

  useEffect(() => {
    const getPocLocations = async () => {
      try {
        const pocLocationsArray = await PocService.getPocLocations(
          params.eventCode as string
        );
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
        if (error instanceof ApiError && error.isNotFound()) {
          setMarkedPoints({});
        } else {
          if (error instanceof ApiError) {
            setError(error.message);
          } else {
            setError("Failed to load POC locations. Please try again.");
          }
        }
      }
    };
    getPocLocations();
  }, [params.eventCode, setMarkedPoints]); // Add dependencies

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    validateImages([file], 5 * 1024 * 1024, 1);

    setNewFloorPlanImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFloorPlanImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setIsFloorPlanChanged(true);
  };

  const handleUploadClick = () => {
    if (uploadFloorPlan.current) {
      uploadFloorPlan.current.click();
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!selectedPoint) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMarkedPoints({
      ...markedPoints,
      [selectedPoint]: { x, y },
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (newFloorPlanImage && isFloorPlanChanged) {
        const uploadedFloorPlanImage =
          await FloorPlanService.uploadFloorPlanImage(
            params.eventCode as string,
            newFloorPlanImage
          );
        await FloorPlanService.saveFloorPlan({
          eventCode: params.eventCode as string,
          floorPlanImageUrl: uploadedFloorPlanImage,
        });
        setIsFloorPlanChanged(false);
      }

      if (Object.keys(markedPoints).length > 0) {
        await PocService.savePocLocations({
          eventCode: params.eventCode as string,
          locations: Object.entries(markedPoints).map(([pocId, pos]) => ({
            pocId: pocId,
            label: "",
            xCoordinate: pos.x,
            yCoordinate: pos.y,
          })),
        });
      }
      router.push(`/admin/events/${params.eventCode}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to save floor plan. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/admin/events" />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Floor Plan Management
          </h1>
          <Button onClick={handleSave} isLoading={isLoading}>
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Check-in Points
              </h2>
              <div className="space-y-2">
                {pocList.map((point) => (
                  <div
                    key={point.pocId}
                    className={`p-2 rounded cursor-pointer ${
                      selectedPoint === point.pocId
                        ? "bg-blue-100 border border-blue-500"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedPoint(point.pocId)}
                  >
                    <p className="font-medium">{point.pointName}</p>
                    <p className="text-sm text-gray-500">{point.pointCode}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floor Plan Display */}
          <div className="md:col-span-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={uploadFloorPlan}
                onChange={handleFileChange}
              />

              {floorPlanImageUrl ? (
                <div className="relative">
                  <img
                    src={floorPlanImageUrl}
                    alt="Floor plan"
                    width={800}
                    height={600}
                    className="w-full rounded-md cursor-crosshair"
                    onClick={handleImageClick}
                  />
                  {/* Render marked points */}
                  {Object.entries(markedPoints).map(([pocId, pos]) => {
                    const point = pocList.find((p) => p.pocId === pocId);
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
                          {point?.pointName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer"
                  onClick={handleUploadClick}
                >
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

            {floorPlanImageUrl && (
              <div className="mt-4">
                <Button onClick={handleUploadClick} variant="outline">
                  Replace Floor Plan
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Instructions
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Upload a floor plan image by clicking the upload area</li>
            <li>Select a check-in point from the sidebar</li>
            <li>
              Click on the floor plan to mark the location of the selected point
            </li>
            <li>Click Save Changes when done</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
