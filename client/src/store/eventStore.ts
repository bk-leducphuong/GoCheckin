import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { EventService } from "@/services/event.service";
import { CreateEventRequest, Event } from "@/types/event";

interface EventStore {
  events: Event[];
  setEvents: (events: Event[]) => void;
  getAllEvents: () => Promise<Event[]>;
  createEvent: (eventData: CreateEventRequest) => Promise<Event>;
  getEventByCode: (eventCode: string) => Promise<Event>;
  updateEvent: (eventCode: string, eventData: CreateEventRequest) => Promise<Event>;
}

export const useEventStore = create<EventStore>()(
  devtools(
    (set) => ({
      events: [],
      setEvents: (events) => set({ events }),
      getAllEvents: async () => {
        try {
          const response = await EventService.getAllEvents();
          set({ events: response });
          return response;
        } catch (error) {
          console.error("Error getting all events:", error);
          throw error;
        }
      },
      createEvent: async (eventData: CreateEventRequest) => {
        try {
          const response = await EventService.createEvent(eventData);
          set((state) => ({
            events: [...state.events, response],
          }));
          return response;
        } catch (error) {
          console.error("Error creating event:", error);
          throw error;
        }
      },
      getEventByCode: async (eventCode: string) => {
        try {
          const response = await EventService.getEventByCode(eventCode);
          return response;
        } catch (error) {
          console.error("Error getting event:", error);
          throw error;
        }
      },
      updateEvent: async (eventCode: string, eventData: CreateEventRequest) => {
        try {
          const response = await EventService.updateEvent(eventCode, eventData);
          set((state) => ({
            events: state.events.map((event) =>
              event.eventCode === eventCode ? response : event
            ),
          }));
          return response;
        } catch (error) {
          console.error("Error updating event:", error);
          throw error;
        }
      },
    }),
    {
      name: "Event Storage",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
