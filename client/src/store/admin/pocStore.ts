import { Poc, PocInvite, UpdatePocRequest } from "@/types/poc";
import { create } from "zustand";
import { PocService } from "@/services/admin/poc.service";
import { devtools } from "zustand/middleware";

interface PocStore {
  pocList: Poc[];
  eventCode: string;
  pocInvite: PocInvite | null;
  setPocInvite: (pocInvite: PocInvite | null) => void;
  setPocList: (pocList: Poc[]) => void;
  getAllPocs: (eventCode: string) => Promise<Poc[]>;
  getPocInvite: (eventCode: string, pointCode: string) => Promise<PocInvite>;
}

export const usePocStore = create<PocStore>()(
  devtools(
    (set, get) => ({
      poc: null,
      pocList: [],
      pocInvite: null,
      setPocInvite: (pocInvite: PocInvite | null) => {
        set({ pocInvite: pocInvite });
      },
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
      getPocInvite: async (eventCode: string, pointCode: string) => {
        try {
          const pocInvite = await PocService.getPocInvite(eventCode, pointCode);
          set({ pocInvite: pocInvite });
        } catch (error) {
          console.error("Error getting POC invite:", error);
          throw error;
        }
      },
    }),
    {
      name: "Poc Storage",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
