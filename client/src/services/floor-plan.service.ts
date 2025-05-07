import api from "./api";
import { FloorPlan } from "@/types/floorPlan";

export const FloorPlanService = {
  async uploadFloorPlanImage(
    eventCode: string,
    floorPlanImage: File
  ): Promise<string> {
    const formData = new FormData();
    formData.append("image", floorPlanImage);
    const response = await api.post(
      `/floor-plan/${eventCode}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.data; // Url to image stored in S3
  },

  async saveFloorPlan(floorPlan: FloorPlan) {
    const response = await api.post("/floor-plan", floorPlan);
    return response.data.data;
  },

  async getFloorPlanImage(eventCode: string): Promise<Blob> {
    const response = await api.get(`/floor-plan/${eventCode}`);
    return response.data.data; // Url to image stored in S3
  },
};
