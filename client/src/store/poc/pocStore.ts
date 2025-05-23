import { Poc } from "@/types/poc";
import { create } from "zustand";
import { PocService } from "@/services/poc/poc.service";
import { devtools } from "zustand/middleware";

interface PocStore {
  pocList: Poc[];
  poc: Poc | null;
  setPoc: (poc: Poc | null) => void;
  validatePoc: (pointCode: string, eventCode: string) => Promise<void>;
  getPocsByUserId: (userId: string) => Promise<Poc[]>;
}

export const usePocStore = create<PocStore>()(
  devtools(
    (set) => ({
      pocList: [],
      poc: null,
      setPoc: (poc) => set({ poc }),
      validatePoc: async (pointCode: string, eventCode: string) => {
        const poc = await PocService.validatePoc({
          pointCode: pointCode,
          eventCode: eventCode,
        });
        set({ poc: poc });
      },
      getPocsByUserId: async (userId: string) => {
        const pocs = await PocService.getPocsByUserId(userId);
        set({ pocList: pocs });
      },
    }),
    {
      name: "Poc Storage",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
