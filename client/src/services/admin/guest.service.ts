import { CheckInResponse } from "@/types/checkin";
import api from "./api";

export const GuestService = {
  async getAllGuestsOfPoc(
    eventCode: string,
    pointCode: string
  ): Promise<CheckInResponse[]> {
    const response = await api.get(
      `/guests/poc?eventCode=${eventCode}&pointCode=${pointCode}`
    );
    return response.data.data;
  },

  async getAllGuestsOfEvent(eventCode: string): Promise<CheckInResponse[]> {
    const response = await api.get(`/guests/event?eventCode=${eventCode}`);
    return response.data.data;
  },
};
