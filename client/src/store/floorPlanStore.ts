import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { FloorPlanService } from "@/services/floor-plan.service";

interface FloorPlanStore {
  floorPlanImage: Blob | null;
  eventCode: string | null;
  getFloorPlanImage: (eventCode: string) => Promise<Blob>;
}

export const useFloorPlanStore = create<FloorPlanStore>()(
  devtools(
    (set) => ({
      floorPlanImage: null,
      eventCode: null,
      getFloorPlanImage: async (eventCode: string) => {
        const response = await FloorPlanService.getFloorPlan(
          eventCode as string
        );
        set({ floorPlanImage: response });
        set({ eventCode: eventCode });
        return response;
      },
    }),
    {
      name: "floorPlanStore",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
