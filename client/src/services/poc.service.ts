import { Poc } from "@/types/poc";
import api from "./api";
import { PocValidationData, CreatePocRequest, UpdatePocRequest } from "@/types/poc";

export const PocService = {
  async validatePoc(data: PocValidationData): Promise<Poc> {
    try {
      const response = await api.post("/pocs/validate-poc", {
        eventCode: data.eventCode,
        pointCode: data.pointCode,
      });

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  async createPoc(eventCode: string, pocData: CreatePocRequest): Promise<Poc> {
    try {
      const response = await api.post(`/pocs/event?eventCode=${eventCode}`, pocData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  async getAllPocs(eventCode: string): Promise<Poc[]> {
    try {
      const response = await api.get(`/pocs/event?eventCode=${eventCode}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  async updatePoc(pocId: string,pocData: UpdatePocRequest): Promise<Poc> {
    try {
      const response = await api.put(`/pocs/poc?pocId=${pocId}`, pocData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  async removePoc(pocId: string): Promise<void> {
    try {
      await api.delete(`/pocs/poc?pocId=${pocId}`);
    } catch (error) {
      throw error;
    }
  }
};
