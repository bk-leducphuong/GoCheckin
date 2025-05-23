import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { EventService } from "@/services/poc/event.service";
import { Event } from "@/types/event";
import { EventStatus } from "@/types/event";

interface EventStore {
  selectedEvent: Event;
  events: Event[];
  isLoading: boolean;
  error: string | null;
  setSelectedEvent: (event: Event) => void;
  setEvents: (events: Event[]) => void;
  getEventByCode: (eventCode: string) => Promise<Event>;
  getEventStatus: (eventCode: string) => Promise<EventStatus>;
}

export const useEventStore = create<EventStore>()(
  devtools(
    (set, get) => ({
      events: [],
      selectedEvent: null,
      setSelectedEvent: (event: Event) => {
        set({ selectedEvent: event });
      },
      setEvents: (events) => set({ events }),
      getEventByCode: async (eventCode: string) => {
        const selectedEvent = get().selectedEvent;
        if (selectedEvent && selectedEvent.eventCode === eventCode) {
          return selectedEvent;
        }
        const event = await EventService.getEventByCode(eventCode);
        set({ selectedEvent: event });
        return event;
      },
      getEventStatus: async (eventCode: string) => {
        const response = await EventService.getEventStatus(eventCode);
        return response;
      },
    }),
    {
      name: "Event Storage",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
