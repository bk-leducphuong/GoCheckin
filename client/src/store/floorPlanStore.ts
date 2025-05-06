import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { FloorPlanService } from "@/services/floor-plan.service";
import { ApiError } from "@/lib/error";

interface FloorPlanStore {
  floorPlanImage: Blob | null;
  eventCode: string | null;
  getFloorPlanImage: (eventCode: string) => Promise<Blob | null>;
}

export const useFloorPlanStore = create<FloorPlanStore>()(
  devtools(
    (set, get) => ({
      floorPlanImage: null,
      eventCode: null,
      getFloorPlanImage: async (eventCode: string) => {
        const currentState = get();
        if (
          currentState.floorPlanImage &&
          currentState.eventCode === eventCode
        ) {
          return currentState.floorPlanImage;
        }

        try {
          console.log("Fetching floor plan image for event code:", eventCode);
          const response = await FloorPlanService.getFloorPlanImage(eventCode);
          set({
            floorPlanImage: response,
            eventCode: eventCode,
          });
          return response;
        } catch (error) {
          if (error instanceof ApiError && error.isNotFound()) {
            set({ floorPlanImage: null, eventCode: null });
            return null;
          }
          throw error;
        }
      },
    }),
    {
      name: "floorPlanStore",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
