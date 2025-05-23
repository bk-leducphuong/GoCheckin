import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { GuestService } from "@/services/admin/guest.service";
import { CheckInResponse } from "@/types/checkin";

interface GuestStore {
  guests: CheckInResponse[];
  getAllGuestsOfEvent: (eventCode: string) => Promise<void>;
  addNewCheckinGuest: (guest: CheckInResponse) => void;
}

export const useGuestStore = create<GuestStore>()(
  devtools((set) => ({
    guests: [],
    async getAllGuestsOfEvent(eventCode: string) {
      try {
        const guests = await GuestService.getAllGuestsOfEvent(eventCode);
        set({ guests });
      } catch (error) {
        console.error("Error fetching guests:", error);
        throw error;
      }
    },
    addNewCheckinGuest: (guest: CheckInResponse) => {
      set((state) => ({ guests: [guest, ...state.guests] }));
    },
  }))
);
