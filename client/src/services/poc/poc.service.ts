import { Poc, PocValidationData, PocLocation } from "@/types/poc";
import api from "./api";

export const PocService = {
  async validatePoc(data: PocValidationData): Promise<Poc> {
    const response = await api.post("/pocs/validate-poc", {
      eventCode: data.eventCode,
      pointCode: data.pointCode,
    });

    return response.data.data;
  },
  async getPocLocations(eventCode: string): Promise<PocLocation[]> {
    const response = await api.get(`/pocs/locations?eventCode=${eventCode}`);
    return response.data.data;
  },
  async getPocsByUserId(userId: string): Promise<Poc[]> {
    const response = await api.get(`/pocs/user/${userId}`);
    return response.data.data;
  },
};
