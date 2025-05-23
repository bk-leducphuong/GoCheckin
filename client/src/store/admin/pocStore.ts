import { Poc, UpdatePocRequest } from "@/types/poc";
import { create } from "zustand";
import { PocService } from "@/services/admin/poc.service";
import { devtools } from "zustand/middleware";

interface PocStore {
  pocList: Poc[];
  eventCode: string;
  setPocList: (pocList: Poc[]) => void;
  getAllPocs: (eventCode: string) => Promise<Poc[]>;
}

export const usePocStore = create<PocStore>()(
  devtools(
    (set, get) => ({
      poc: null,
      pocList: [],
      setPocList: (pocList: Poc[]) => {
        set({ pocList: pocList });
      },
      getAllPocs: async (eventCode: string) => {
        const currentState = get();
        if (
          currentState.pocList.length > 0 &&
          currentState.eventCode === eventCode
        ) {
          return currentState.pocList;
        }

        try {
          const pocList = await PocService.getAllPocs(eventCode);
          set({ pocList: pocList });
          set({ eventCode: eventCode });
          return pocList;
        } catch (error) {
          console.error("Error getting all POCs:", error);
          throw error;
        }
      },
      updatePoc: async (pocId: string, pocData: UpdatePocRequest) => {
        try {
          await PocService.updatePoc(pocId, pocData);
          set((state) => ({
            pocList: state.pocList.map((poc) =>
              poc.pocId === pocId ? { ...poc, ...pocData } : poc
            ),
          }));
        } catch (error) {
          console.error("Error updating POC:", error);
          throw error;
        }
      },
      removePoc: async (pocId: string) => {
        try {
          await PocService.removePoc(pocId);
          set((state) => ({
            pocList: state.pocList.filter((poc) => poc.pocId !== pocId),
          }));
        } catch (error) {
          console.error("Error removing POC:", error);
          throw error;
        }
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
