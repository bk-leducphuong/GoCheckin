import api from "./api";
import { EventCheckinAnalytics, PointCheckinAnalytics } from "@/types/analysis";

export const AnalysisService = {
  async getAllEventCheckinAnalytics(
    eventCode: string,
    intervalDuration: "hourly" | "15min" | "30min" | "daily" = "hourly"
  ): Promise<EventCheckinAnalytics[]> {
    try {
      const response = await api.get(
        `/analysis/event?eventCode=${eventCode}&intervalDuration=${intervalDuration}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Get all event check-in analytics error:", error);
      throw error;
    }
  },
  async getAllPointCheckinAnalytics(
    eventCode: string,
    intervalDuration: "hourly" | "15min" | "30min" | "daily" = "hourly"
  ): Promise<PointCheckinAnalytics[]> {
    try {
      const response = await api.get(
        `/analysis/point?eventCode=${eventCode}&intervalDuration=${intervalDuration}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Get all point check-in analytics error:", error);
      throw error;
    }
  },
};
