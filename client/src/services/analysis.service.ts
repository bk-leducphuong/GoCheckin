import api from "./api";
import { EventCheckinAnalytics, PointCheckinAnalytics } from "@/types/analysis";

export const AnalysisService = {
  async getAllEventCheckinAnalytics(
    eventCode: string,
    intervalDuration: "hourly" | "15min" | "30min" | "daily" = "hourly"
  ): Promise<EventCheckinAnalytics[]> {
    const response = await api.get(
      `/analysis/event?eventCode=${eventCode}&intervalDuration=${intervalDuration}`
    );
    return response.data.data;
  },
  async getAllPointCheckinAnalytics(
    eventCode: string,
    intervalDuration: "hourly" | "15min" | "30min" | "daily" = "hourly"
  ): Promise<PointCheckinAnalytics[]> {
    const response = await api.get(
      `/analysis/point?eventCode=${eventCode}&intervalDuration=${intervalDuration}`
    );
    return response.data.data;
  },
};
