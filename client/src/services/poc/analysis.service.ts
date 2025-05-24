import api from "./api";
import { PointCheckinAnalytics } from "@/types/analysis";

export const AnalysisService = {
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
