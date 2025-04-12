import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CheckinService } from "../services/checkin.service";
import { CheckInResponse, GuestCheckinInfo } from "@/types/checkin";

interface CheckinStore {
  guests: CheckInResponse[];
  isLoading: boolean;
  error: string | null;
  uploadGuestImage: (guestImage: string | null) => Promise<string>;
  checkinGuest: (checkinDto: GuestCheckinInfo) => Promise<void>;
  fetchGuests: (eventCode: string, pointCode: string) => Promise<void>;
}

export const useCheckinStore = create<CheckinStore>()(
  devtools((set) => ({
    guests: [],
    async uploadGuestImage(guestImage: string | null) {
      try {
        const imageUrl = await CheckinService.uploadGuestImage(guestImage);
        return imageUrl;
      } catch (error) {
        console.error("Error uploading guest image:", error);
        throw error;
      }
    },
    async checkinGuest(checkinDto: GuestCheckinInfo) {
      try {
        const response = await CheckinService.checkinGuest(checkinDto);
        set((state) => ({ guests: [...state.guests, response] }));
      } catch (error) {
        console.error("Error checking in guest:", error);
        throw error;
      }
    },  
    async fetchGuests(eventCode: string, pointCode: string) {
      try {
        set({ isLoading: true, error: null });
        const guests = await CheckinService.getAllGuestsOfPoc(eventCode, pointCode);
        set({ guests });
        set({ isLoading: false });
      } catch (error) {
        set({ isLoading: false, error: "Failed to fetch guests" });
        console.error("Error fetching guests:", error);
        throw error;
      }
    },
  }))
);
