import api from "./api";
import { Event } from "../types/event";
import { CreateEventRequest } from "../types/event";
import { EventStatus } from "../types/event";
import imageCompression from "browser-image-compression";
import { blobToFile } from "@/utils/blobToFile";

export const EventService = {
  async getAllEvents(): Promise<Event[]> {
    const response = await api.get("/events");
    return response.data.data;
  },

  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    const response = await api.post("/events", eventData);
    return response.data.data;
  },

  async uploadEventImages(eventCode: string, images: File[]) {
    // Compress images
    const compressedImages = await Promise.all(
      images.map(async (image) => {
        const compressedImage = await imageCompression(image, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });
        const file = blobToFile(compressedImage, image.name);
        return file;
      })
    );

    const formData = new FormData();
    for (const image of compressedImages) {
      formData.append("images", image);
    }

    const response = await api.post(
      `/events/${eventCode}/images/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data; // Image Url Array
  },

  async getEventImages(eventCode: string) {
    const response = await api.get(`${eventCode}/images`);
    return response.data.data;
  },

  async getEventByCode(eventCode: string): Promise<Event> {
    const response = await api.get(`/events/${eventCode}`);
    return response.data.data;
  },

  async updateEvent(
    eventCode: string,
    eventData: CreateEventRequest
  ): Promise<Event> {
    const response = await api.put(`/events/${eventCode}`, eventData);
    return response.data.data;
  },
  async getEventStatus(eventCode: string): Promise<EventStatus> {
    const response = await api.get(`/events/${eventCode}/status`);
    return response.data.data;
  },

  async deleteEvent(eventCode: string) {
    await api.delete(`/events/${eventCode}`);
  },
};
