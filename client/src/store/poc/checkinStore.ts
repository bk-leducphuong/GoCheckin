import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CheckinService } from "@/services/poc/checkin.service";
import { GuestService } from "@/services/poc/guest.service";
import { CheckInResponse, GuestCheckinInfo } from "@/types/checkin";

interface CheckinStore {
  guests: CheckInResponse[];
  uploadGuestImage: (guestImage: string | null) => Promise<string>;
  checkinGuest: (checkinDto: GuestCheckinInfo) => Promise<CheckInResponse>;
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
        return response;
      } catch (error) {
        console.error("Error checking in guest:", error);
        throw error;
      }
    },
    async fetchGuests(eventCode: string, pointCode: string) {
      try {
        const guests = await GuestService.getAllGuestsOfPoc(
          eventCode,
          pointCode
        );
        set({ guests });
      } catch (error) {
        console.error("Error fetching guests:", error);
        throw error;
      }
    },
  }))
);
