import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { EventService } from "@/services/event.service";
import { CreateEventRequest, Event } from "@/types/event";
import { EventStatus } from "@/types/event";

interface EventStore {
  selectedEvent: Event;
  events: Event[];
  isLoading: boolean;
  error: string | null;
  setSelectedEvent: (event: Event) => void;
  setEvents: (events: Event[]) => void;
  getAllEvents: () => Promise<Event[]>;
  createEvent: (eventData: CreateEventRequest) => Promise<Event>;
  getEventByCode: (eventCode: string) => Promise<Event>;
  updateEvent: (
    eventCode: string,
    eventData: CreateEventRequest
  ) => Promise<Event>;
  getEventStatus: (eventCode: string) => Promise<EventStatus>;
}

export const useEventStore = create<EventStore>()(
  devtools(
    (set) => ({
      events: [],
      selectedEvent: null,
      isLoading: false,
      error: null,
      setSelectedEvent: (event) => set({ selectedEvent: event }),
      setEvents: (events) => set({ events }),
      getAllEvents: async () => {
        const response = await EventService.getAllEvents();
        set({ events: response });
        return response;
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
        const event = await EventService.getEventByCode(eventCode);
        return event;
      },
      updateEvent: async (eventCode: string, eventData: CreateEventRequest) => {
        const response = await EventService.updateEvent(eventCode, eventData);
        set((state) => ({
          events: state.events.map((event) =>
            event.eventCode === eventCode ? response : event
          ),
        }));
        return response;
      },
      async getEventStatus(eventCode: string): Promise<EventStatus> {
        set({ isLoading: true, error: null });
        const response = await EventService.getEventStatus(eventCode);
        set({ isLoading: false });
        return response;
      },
    }),
    {
      name: "Event Storage",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
