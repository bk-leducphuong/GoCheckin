import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { FloorPlanService } from "@/services/poc/floor-plan.service";
import { ApiError } from "@/lib/error";

interface FloorPlanStore {
  floorPlanImageUrl: string | null;
  eventCode: string | null;
  getFloorPlanImage: (eventCode: string) => Promise<string | null>;
}

export const useFloorPlanStore = create<FloorPlanStore>()(
  devtools(
    (set, get) => ({
      floorPlanImageUrl: null,
      eventCode: null,
      getFloorPlanImage: async (eventCode: string) => {
        const currentState = get();
        if (
          currentState.floorPlanImageUrl &&
          currentState.eventCode === eventCode
        ) {
          return currentState.floorPlanImageUrl;
        }

        try {
          const response = await FloorPlanService.getFloorPlanImage(eventCode);
          set({
            floorPlanImageUrl: response,
            eventCode: eventCode,
          });
          return response;
        } catch (error) {
          if (error instanceof ApiError && error.isNotFound()) {
            set({ floorPlanImageUrl: null, eventCode: null });
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
