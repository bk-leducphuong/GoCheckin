import api from "./api";

export const FloorPlanService = {
  async getFloorPlanImage(eventCode: string): Promise<string> {
    const response = await api.get(`/floor-plan/${eventCode}`);
    return response.data.data; // Url to image stored in S3
  },
};
