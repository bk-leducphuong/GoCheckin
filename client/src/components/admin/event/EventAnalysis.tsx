"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { Line, Bar } from "react-chartjs-2";
import { AnalysisService } from "@/services/admin/analysis.service";

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

interface CheckinPointData {
  pointCode: string;
  count: number;
  timestamp: string;
}

export default function EventAnalysis({ eventCode }: { eventCode: string }) {
  const [checkinData, setCheckinData] = useState<CheckinData[]>([]);
  const [checkinPointData, setCheckinPointData] = useState<CheckinPointData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate consistent colors for points
  const getPointColor = useCallback((pointCode: string) => {
    const hash = pointCode.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const h = hash % 360;
    return `hsla(${h}, 70%, 50%, 0.8)`;
  }, []);

  useEffect(() => {
    const getAllEventCheckinAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await AnalysisService.getAllEventCheckinAnalytics(
          eventCode,
          "hourly"
        );
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

    getAllEventCheckinAnalytics();
  }, [eventCode]);

  useEffect(() => {
    const getAllPointCheckinAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await AnalysisService.getAllPointCheckinAnalytics(
          eventCode,
          "hourly"
        );
        const formattedData = response.map((data) => ({
          timestamp: new Date(data.timeInterval).toLocaleTimeString(),
          pointCode: data.pointCode,
          count: data.checkinCount,
        }));
        setCheckinPointData(formattedData);
      } catch (error) {
        console.error("Error fetching point check-in analytics:", error);
        setError("Failed to load point check-in data");
      } finally {
        setIsLoading(false);
      }
    };

    getAllPointCheckinAnalytics();
  }, [eventCode]);

  // Check-in timeline data
  const eventCheckinAnalysisData = {
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

  // Check-in points performance data
  const pointCheckinAnalysisData = {
    labels: Array.from(new Set(checkinPointData.map((d) => d.timestamp))),
    datasets: Array.from(new Set(checkinPointData.map((d) => d.pointCode))).map(
      (pointCode) => ({
        label: pointCode,
        data: Array.from(new Set(checkinPointData.map((d) => d.timestamp))).map(
          (timestamp) => {
            const dataPoint = checkinPointData.find(
              (d) => d.timestamp === timestamp && d.pointCode === pointCode
            );
            return dataPoint ? dataPoint.count : 0;
          }
        ),
        backgroundColor: getPointColor(pointCode),
        stack: "stack1",
      })
    ),
  };

  const eventCheckinChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  const pointCheckinChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Check-in Count Across Points Over Time",
      },
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: "Check-in Count",
        },
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
    <div className="space-y-8">
      <div className="">
        {/* Check-in Timeline */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Check-in Timeline</h3>
          <div className="h-[300px]">
            <Line
              data={eventCheckinAnalysisData}
              options={eventCheckinChartOptions}
            />
          </div>
        </div>
      </div>

      {/* Check-in Points Performance */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          Check-in Points Performance
        </h3>
        <div className="h-[300px]">
          <Bar
            data={pointCheckinAnalysisData}
            options={pointCheckinChartOptions}
          />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-500">Total Check-ins</h4>
          <p className="text-2xl font-bold text-gray-900">
            {checkinData.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-500">
            Active Check-in Points
          </h4>
          <p className="text-2xl font-bold text-gray-900">{}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-500">
            Average Check-ins per Point
          </h4>
          <p className="text-2xl font-bold text-gray-900"></p>
        </div>
      </div>
    </div>
  );
}
