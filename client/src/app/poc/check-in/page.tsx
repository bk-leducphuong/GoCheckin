"use client";

import React, { useEffect, useState, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import Button from "@/components/ui/Button";
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
import Webcam from "@/components/ui/Webcam";
import * as faceapi from "face-api.js";

export default function CheckinPage() {
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
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState({});
  const [devices, setDevices] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
  }, [eventCode, getEventByCode]);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    };

    loadModels();
  }, []);

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

  const turnOnOffCamera = () => {
    setIsCameraOpen(!isCameraOpen);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    let count = 0;

    const detectFaces = async () => {
      if (webcamRef.current && canvasRef.current && isCameraOpen) {
        const video = webcamRef.current.video;
        if (!video) return;

        const canvas = canvasRef.current;
        const displaySize = {
          width: video.videoWidth,
          height: video.videoHeight,
        };

        // Match canvas size to video
        if (
          canvas.width !== displaySize.width ||
          canvas.height !== displaySize.height
        ) {
          canvas.width = displaySize.width;
          canvas.height = displaySize.height;
        }

        try {
          const detections = await faceapi.detectSingleFace(video);

          if (detections) {
            const context = canvas.getContext("2d");
            if (context) {
              context.clearRect(0, 0, canvas.width, canvas.height);

              if (detections.score > 0.9) {
                count++;
                const resizedDetections = faceapi.resizeResults(
                  detections,
                  displaySize
                );
                faceapi.draw.drawDetections(canvas, resizedDetections);

                if (count > 30) {
                  capture();
                  count = 0;
                }
              } else {
                count = 0;
              }
            }
          }
        } catch (error) {
          console.error("Face detection error:", error);
        }
      }
    };

    if (isCameraOpen) {
      intervalId = setInterval(detectFaces, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCameraOpen]);

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setGuestImage(imageSrc);
    }
  };

  if (isLoading || !selectedEvent) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/login" />;
  }

  return (
    <div className="mx-auto px-4 py-6 w-full">
      {/* Section 2: Check-in Section */}
      {selectedEvent.eventStatus === EventStatus.ACTIVE && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Guest Check-in
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Guest Image Capture */}
            <div className="col-span-1">
              <div
                className="bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative"
                style={{ height: "400px" }}
              >
                {isCameraOpen && (
                  <>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        facingMode: "environment",
                      }}
                      width="100%"
                      height="100%"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 z-10"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={turnOnOffCamera}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaCamera className="mr-2" />
                  {isCameraOpen ? "Close" : "Open"} camera
                </button>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col space-y-4">
              <div>
                <label
                  htmlFor="guestCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Guest Image
                </label>
                {guestImage ? (
                  <img
                    src={guestImage}
                    alt="Guest Photo"
                    className="object-cover"
                    style={{ width: "200px", height: "200px" }}
                    onError={() => setGuestImage(null)}
                  />
                ) : (
                  <div
                    className="bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative"
                    style={{ width: "200px", height: "200px" }}
                  >
                    <p className="text-gray-500">No image</p>
                  </div>
                )}
              </div>
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
    </div>
  );
}
