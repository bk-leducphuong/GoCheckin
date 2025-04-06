import { Poc } from "@/types/poc";
import api from "./api";
import { PocValidationData, CreatePocRequest } from "@/types/poc";

export const PocService = {
  async validatePoc(data: PocValidationData): Promise<Poc> {
    try {
      const response = await api.post("/pocs/validate-poc", {
        eventCode: data.eventCode,
        pocId: data.pocId,
      });

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  async createPoc(eventCode: string, pocData: CreatePocRequest): Promise<Poc> {
    try {
      const response = await api.post(`/pocs/${eventCode}`, pocData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};
