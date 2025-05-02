import { Poc } from "@/types/poc";
import api from "./api";
import {
  PocValidationData,
  CreatePocRequest,
  UpdatePocRequest,
  PocManager,
  PocLocations,
  PocLocation,
} from "@/types/poc";

export const PocService = {
  async validatePoc(data: PocValidationData): Promise<Poc> {
    const response = await api.post("/pocs/validate-poc", {
      eventCode: data.eventCode,
      pointCode: data.pointCode,
    });

    return response.data.data;
  },
  async createPoc(eventCode: string, pocData: CreatePocRequest): Promise<Poc> {
    const response = await api.post(
      `/pocs/event?eventCode=${eventCode}`,
      pocData
    );
    return response.data.data;
  },
  async getAllPocs(eventCode: string): Promise<Poc[]> {
    const response = await api.get(`/pocs/event?eventCode=${eventCode}`);
    return response.data.data;
  },
  async getPoc(pointCode: string, eventCode: string): Promise<Poc> {
    const response = await api.get(
      `/pocs/poc?pointCode=${pointCode}&eventCode=${eventCode}`
    );
    return response.data.data;
  },
  async updatePoc(pocId: string, pocData: UpdatePocRequest): Promise<Poc> {
    const response = await api.put(`/pocs/poc?pocId=${pocId}`, pocData);
    return response.data.data;
  },
  async removePoc(pocId: string): Promise<void> {
    await api.delete(`/pocs/poc?pocId=${pocId}`);
  },
  async getPocManager(userId: string): Promise<PocManager> {
    const response = await api.get(`/pocs/poc/manager?userId=${userId}`);
    return response.data.data;
  },
  async savePocLocations(pocLocations: PocLocations) {
    await api.post(`/pocs/locations`, pocLocations);
  },
  async getPocLocations(eventCode: string): Promise<PocLocation[]> {
    const response = await api.get(`/pocs/locations?eventCode=${eventCode}`);
    return response.data.data;
  },
};
