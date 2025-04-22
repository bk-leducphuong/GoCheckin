import api from "./api";

export const FloorPlanService = {
  async uploadFloorPlanImage(floorPlanImage: string | null): Promise<string> {
    if (!floorPlanImage) return "";

    // Convert base64 to blob if needed
    const formData = new FormData();

    // If it's a data URL, extract the base64 part
    if (floorPlanImage.startsWith("data:")) {
      const base64Data = floorPlanImage.split(",")[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(
        (res) => res.blob()
      );
      formData.append("image", blob, "floor-plan-image.jpg");
    } else {
      // It's a string value, just send it as is
      formData.append("floorPlanImage", floorPlanImage);
    }

    const response = await api.post("/floor-plan/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  async getFloorPlan(eventCode: string): Promise<string> {
    const response = await api.get(`/events/${eventCode}/floor-plan`);
    return response.data.data;
  },
};
