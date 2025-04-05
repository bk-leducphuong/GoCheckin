import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { EventService } from "@/services/event.service";
import { Event } from "@/types/event";

interface EventStore {
  events: Event[];
  setEvents: (events: Event[]) => void;
  getAllEvents: () => Promise<Event[]>;
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
    }),
    {
      name: "Event Storage",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
