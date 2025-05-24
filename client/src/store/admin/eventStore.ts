import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { EventService } from "@/services/admin/event.service";
import { UpdateEventData, Event, CreateEventData } from "@/types/event";
import { EventStatus } from "@/types/event";

interface EventStore {
  selectedEvent: Event;
  events: Event[];
  setSelectedEvent: (event: Event) => void;
  setEvents: (events: Event[]) => void;
  getAllManagedEvents: () => Promise<Event[]>;
  createEvent: (eventData: CreateEventData) => Promise<Event>;
  getEventByCode: (eventCode: string) => Promise<Event>;
  updateEvent: (
    eventCode: string,
    eventData: UpdateEventData
  ) => Promise<Event>;
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
      getAllManagedEvents: async () => {
        const response = await EventService.getAllManagedEvents();
        set({ events: response });
        return response;
      },
      createEvent: async (eventData: CreateEventData) => {
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
      updateEvent: async (eventCode: string, eventData: UpdateEventData) => {
        const response = await EventService.updateEvent(eventCode, eventData);
        set((state) => ({
          events: state.events.map((event) =>
            event.eventCode === eventCode ? response : event
          ),
        }));
        return response;
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
