import { Poc, UpdatePocRequest } from "@/types/poc";
import { create } from "zustand";
import { PocService } from "@/services/poc.service";
import { devtools } from "zustand/middleware";

interface PocStore {
  poc: Poc | null;
  setPoc: (poc: Poc | null) => void;
  validatePoc: (
    pocId: string,
    eventCode: string
  ) => Promise<{ success: boolean }>;
  getAllPocs: (eventCode: string) => Promise<Poc[]>;
}

export const usePocStore = create<PocStore>()(
  devtools(
    (set) => ({
      poc: null,
      setPoc: (poc) => set({ poc }),
      validatePoc: async (
        pocId: string,
        eventCode: string
      ): Promise<{ success: boolean }> => {
        try {
          const response = await PocService.validatePoc({
            pocId: pocId,
            eventCode: eventCode,
          });
          if (!response) {
            return { success: false };
          }

          set({ poc: response });
          return { success: true };
        } catch (error) {
          console.error("Error validating POC:", error);
          return { success: false };
        }
      },
      getAllPocs: async (eventCode: string) => {
        try {
          const pocList = await PocService.getAllPocs(eventCode);
          return pocList;
        } catch (error) {
          console.error("Error getting all POCs:", error);
          throw error;
        }
      },
      updatePoc: async (pocId: string, pocData: UpdatePocRequest) => {
        try {
          const response = await PocService.updatePoc(pocId, pocData);
          return response;
        } catch (error) {
          console.error("Error updating POC:", error);
          throw error;
        }
      },
      removePoc: async (pocId: string) => {
        try {
          await PocService.removePoc(pocId);
        } catch (error) {
          console.error("Error removing POC:", error);
          throw error;
        }
      }
    }),
    {
      name: "Poc Storage",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
