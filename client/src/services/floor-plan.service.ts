import api from "./api";
import { FloorPlan } from "@/types/floorPlan";
import { blobToFile } from "@/utils/blobToFile";
import imageCompression from "browser-image-compression";

export const FloorPlanService = {
  async uploadFloorPlanImage(
    eventCode: string,
    floorPlanImage: File
  ): Promise<string> {
    // Compress image
    const compressedImage = await imageCompression(floorPlanImage, {
      maxSizeMB: 2,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    });

    const file = blobToFile(compressedImage, "floor-plan.png");

    const formData = new FormData();
    formData.append("image", file);

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

  async getFloorPlanImage(eventCode: string): Promise<string> {
    const response = await api.get(`/floor-plan/${eventCode}`);
    return response.data.data; // Url to image stored in S3
  },
};
