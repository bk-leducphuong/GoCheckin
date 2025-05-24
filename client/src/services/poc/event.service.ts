import api from "./api";
import { Event } from "@/types/event";
import { EventStatus } from "@/types/event";
import { EventContraints } from "@/types/event";

export const EventService = {
  async getAllEventsByConstraints(
    eventContraints: EventContraints
  ): Promise<Event[]> {
    const response = await api.get(
      `/events/all?status=${eventContraints.status}&type=${eventContraints.type}`
    );
    return response.data.data;
  },
  async getEventImages(eventCode: string) {
    const response = await api.get(`${eventCode}/images`);
    return response.data.data;
  },

  async getEventByCode(eventCode: string): Promise<Event> {
    const response = await api.get(`/events/${eventCode}`);
    return response.data.data;
  },
  async getEventStatus(eventCode: string): Promise<EventStatus> {
    const response = await api.get(`/events/${eventCode}/status`);
    return response.data.data;
  },
};
