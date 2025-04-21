import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { AnalysisService } from "@/services/analysis.service";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface CheckinData {
  timestamp: string;
  count: number;
}

interface PocAnalysisProps {
    eventCode: string;
    pointCode: string;
}

export default function PocAnalysis({ eventCode, pointCode }: PocAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkinData, setCheckinData] = useState<CheckinData[]>([]);

  useEffect(() => {
    const getPocAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await AnalysisService.getAllPointCheckinAnalytics(
          eventCode,
          "hourly"
        );
        response.filter(data => data.pointCode === pointCode);
        // Format the data for the chart
        const formattedData = response.map((data) => ({
          timestamp: new Date(data.timeInterval).toLocaleTimeString(),
          count: data.checkinCount,
        }));
        setCheckinData(formattedData);
      } catch (error) {
        console.error("Error fetching event check-in analytics:", error);
        setError("Failed to load event check-in data");
      } finally {
        setIsLoading(false);
      }
    };

    getPocAnalytics();
  }, [pointCode, eventCode]);
  // Check-in timeline data
  const pocCheckinAnalysisData = {
    labels: checkinData.map((d) => d.timestamp),
    datasets: [
      {
        label: "Check-ins",
        data: checkinData.map((d) => d.count),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        fill: false,
      },
    ],
  };
  const pocCheckinChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 rounded-md bg-red-50 border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-5">
      <div className="">
        {/* Check-in Timeline */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Check-in Timeline</h3>
          <div className="h-[300px]">
            <Line
              data={pocCheckinAnalysisData}
              options={pocCheckinChartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
