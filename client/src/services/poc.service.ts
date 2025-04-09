import { Poc } from "@/types/poc";
import api from "./api";
import { PocValidationData, CreatePocRequest, UpdatePocRequest } from "@/types/poc";

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
  },
  async getAllPocs(eventCode: string): Promise<Poc[]> {
    try {
      const response = await api.get(`/pocs/${eventCode}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  async updatePoc(pocId: string,pocData: UpdatePocRequest): Promise<Poc> {
    try {
      const response = await api.put(`/pocs/${pocId}`, pocData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  async removePoc(pocId: string): Promise<void> {
    try {
      await api.delete(`/pocs/${pocId}`);
    } catch (error) {
      throw error;
    }
  }
};
