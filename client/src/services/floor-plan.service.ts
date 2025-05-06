import api from "./api";
import { FloorPlan } from "@/types/floorPlan";

export const FloorPlanService = {
  async uploadFloorPlanImage(floorPlanImage: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", floorPlanImage);
    const response = await api.post("/floor-plan/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  async saveFloorPlan(floorPlan: FloorPlan) {
    const response = await api.post("/floor-plan", floorPlan);
    return response.data.data;
  },

  async getFloorPlanImage(eventCode: string): Promise<Blob> {
    const response = await api.get(`/floor-plan/${eventCode}`, {
      responseType: "blob",
    });
    return response.data;
  },
};
