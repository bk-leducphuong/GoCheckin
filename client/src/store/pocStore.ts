import { Poc } from "@/types/poc";
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
    }),
    {
      name: "Poc Storage",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
