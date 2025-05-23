import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { EventService } from "@/services/admin/event.service";
import { CreateEventRequest, Event } from "@/types/event";
import { EventStatus } from "@/types/event";

interface EventStore {
  selectedEvent: Event;
  events: Event[];
  isLoading: boolean;
  error: string | null;
  setSelectedEvent: (event: Event) => void;
  setEvents: (events: Event[]) => void;
  getAllEventsByAdmin: () => Promise<Event[]>;
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
    (set, get) => ({
      events: [],
      selectedEvent: null,
      isLoading: false,
      error: null,
      setSelectedEvent: (event: Event) => {
        set({ selectedEvent: event });
      },
      setEvents: (events) => set({ events }),
      getAllEventsByAdmin: async () => {
        const response = await EventService.getAllEventsByAdmin();
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
        const selectedEvent = get().selectedEvent;
        if (selectedEvent && selectedEvent.eventCode === eventCode) {
          return selectedEvent;
        }
        const event = await EventService.getEventByCode(eventCode);
        set({ selectedEvent: event });
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
      getEventStatus: async (eventCode: string) => {
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
