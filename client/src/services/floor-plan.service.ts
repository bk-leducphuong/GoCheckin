import api from "./api";

export const FloorPlanService = {
  async uploadFloorPlanImage(
    floorPlanImage: File | string | null
  ): Promise<string> {
    if (!floorPlanImage) {
      throw new Error("No image provided");
    }

    const formData = new FormData();

    try {
      if (typeof floorPlanImage === "string") {
        // Handle base64 string
        if (floorPlanImage.startsWith("data:")) {
          const base64Data = floorPlanImage.split(",")[1];
          const blob = await fetch(floorPlanImage).then((res) => res.blob());
          formData.append("image", blob, "floor-plan-image.jpg");
        } else {
          throw new Error("Invalid image format");
        }
      } else {
        // Handle File object
        formData.append("image", floorPlanImage);
      }

      const response = await api.post("/floor-plan/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data) {
        throw new Error("Failed to upload floor plan");
      }

      return response.data;
    } catch (error) {
      console.error("Error uploading floor plan:", error);
      throw error;
    }
  },

  async getFloorPlan(eventCode: string): Promise<Blob> {
    try {
      const response = await api.get(`/floor-plan/${eventCode}`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching floor plan:", error);
      throw error;
    }
  },
};
