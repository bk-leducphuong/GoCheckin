import api from "./api"
import { Event } from "../types/event";

export const EventService = {
  async getAllEvents() : Promise<Event[]> {
    try {
      const response = await api.get("/events");
      return response.data.data;
    } catch (error) {
      console.error("Get all events error:", error);
      throw error;
    }
  }
}