import api from "./api";
import { Event } from "../types/event";
import { CreateEventRequest } from "../types/event";
import { EventStatus } from "../types/event";

export const EventService = {
  async getAllEvents(): Promise<Event[]> {
    const response = await api.get("/events");
    return response.data.data;
  },

  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    const response = await api.post("/events", eventData);
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
