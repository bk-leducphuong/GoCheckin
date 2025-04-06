import api from "./api"
import { Event } from "../types/event";
import { CreateEventRequest } from "../types/event";

export const EventService = {
  async getAllEvents() : Promise<Event[]> {
    try {
      const response = await api.get("/events");
      return response.data.data;
    } catch (error) {
      console.error("Get all events error:", error);
      throw error;
    }
  },

  async createEvent(eventData: CreateEventRequest) : Promise<Event> {
    try {
      const response = await api.post("/events", eventData);
      return response.data.data;
    } catch (error) {
      console.error("Create event error:", error);
      throw error;
    }
  },
}