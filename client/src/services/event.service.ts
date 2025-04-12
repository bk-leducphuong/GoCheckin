import api from "./api";
import { Event } from "../types/event";
import { CreateEventRequest } from "../types/event";

export const EventService = {
  async getAllEvents(): Promise<Event[]> {
    try {
      const response = await api.get("/events");
      return response.data.data;
    } catch (error) {
      console.error("Get all events error:", error);
      throw error;
    }
  },

  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    try {
      const response = await api.post("/events", eventData);
      return response.data.data;
    } catch (error) {
      console.error("Create event error:", error);
      throw error;
    }
  },

  async getEventByCode(eventCode: string): Promise<Event> {
    try {
      const response = await api.get(`/events/${eventCode}`);
      return response.data.data;
    } catch (error) {
      console.error("Get event error:", error);
      throw error;
    }
  },

  async updateEvent(
    eventCode: string,
    eventData: CreateEventRequest
  ): Promise<Event> {
    try {
      const response = await api.put(`/events/${eventCode}`, eventData);
      return response.data.data;
    } catch (error) {
      console.error("Update event error:", error);
      throw error;
    }
  },
  async checkEventStartingStatus(eventCode: string): Promise<boolean> {
    const response = await api.get(`/events/${eventCode}/status`);
    return response.data.data;
  },
};
