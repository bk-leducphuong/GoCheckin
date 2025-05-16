"use client";

import React, { useState, useEffect } from "react";
import { Line, Doughnut } from "react-chartjs-2";

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
import { GuestService } from "@/services/guest.service";
import { CheckInResponse } from "@/types/checkin";
import { useSearchParams } from "next/navigation";

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
  timestamp: string;
  pointCode: string;
  count: number;
}

export default function PocAnalysis() {
  const pointCode = useSearchParams().get("pointCode") as string;
  const eventCode = useSearchParams().get("eventCode") as string;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkinData, setCheckinData] = useState<CheckinData[]>([]);
  const [allPointsData, setAllPointsData] = useState<CheckinPointData[]>([]);
  const [guests, setGuests] = useState<CheckInResponse[]>([]);
  const [totalGuests, setTotalGuests] = useState(0);

  // Fetch point-specific check-in data
  useEffect(() => {
    const getPocAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await AnalysisService.getAllPointCheckinAnalytics(
          eventCode,
          "hourly"
        );
        const filteredData = response.filter(
          (data) => data.pointCode === pointCode
        );

        // Format the data for the chart
        const formattedData = filteredData.map((data) => ({
          timestamp: new Date(data.timeInterval).toLocaleTimeString(),
          count: data.checkinCount,
        }));
        setCheckinData(formattedData);
      } catch (error) {
        console.error("Error fetching point check-in analytics:", error);
        setError("Failed to load point check-in data");
      } finally {
        setIsLoading(false);
      }
    };

    getPocAnalytics();
  }, [pointCode, eventCode]);

  // Fetch all points data for comparison
  useEffect(() => {
    const getAllPointsData = async () => {
      try {
        const response = await AnalysisService.getAllPointCheckinAnalytics(
          eventCode,
          "hourly"
        );

        // Format the data for the chart
        const formattedData = response.map((data) => ({
          timestamp: new Date(data.timeInterval).toLocaleTimeString(),
          pointCode: data.pointCode,
          count: data.checkinCount,
        }));
        setAllPointsData(formattedData);
      } catch (error) {
        console.error("Error fetching all points check-in analytics:", error);
      }
    };

    getAllPointsData();
  }, [eventCode]);

  // Fetch guest data
  useEffect(() => {
    const getGuestData = async () => {
      try {
        // Get guests for this specific point
        const pointGuests = await GuestService.getAllGuestsOfPoc(
          eventCode,
          pointCode
        );
        setGuests(pointGuests);

        // Get all guests for the event to calculate total
        const allGuests = await GuestService.getAllGuestsOfEvent(eventCode);
        setTotalGuests(allGuests.length);
      } catch (error) {
        console.error("Error fetching guest data:", error);
      }
    };

    getGuestData();
  }, [eventCode, pointCode]);

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

  // Point comparison data (all points in the event)
  const pointComparisonData = {
    labels: Array.from(new Set(allPointsData.map((d) => d.pointCode))),
    datasets: [
      {
        label: "Total Check-ins by Point",
        data: Array.from(new Set(allPointsData.map((d) => d.pointCode))).map(
          (code) => {
            return allPointsData
              .filter((d) => d.pointCode === code)
              .reduce((sum, d) => sum + d.count, 0);
          }
        ),
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const pocCheckinChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Hourly Check-in Activity",
      },
    },
  };

  const pointComparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Check-in Distribution by Point",
      },
    },
  };

  // Calculate statistics
  const totalPointCheckins = checkinData.reduce((sum, d) => sum + d.count, 0);
  const percentOfTotal =
    totalGuests > 0 ? Math.round((totalPointCheckins / totalGuests) * 100) : 0;
  const peakHour =
    checkinData.length > 0
      ? checkinData.reduce((prev, current) =>
          prev.count > current.count ? prev : current
        ).timestamp
      : "N/A";

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
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-500">
            Total Check-ins at this Point
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {totalPointCheckins.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {percentOfTotal}% of all event check-ins
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-500">
            Total Event Guests
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {totalGuests.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-500">
            Peak Check-in Time
          </h4>
          <p className="text-2xl font-bold text-gray-900">{peakHour}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Point Comparison */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Point Comparison</h3>
          <div className="h-[300px]">
            <Doughnut
              data={pointComparisonData}
              options={pointComparisonOptions}
            />
          </div>
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Check-ins</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Guest Code
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Check-in Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Guest Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guests.slice(0, 5).map((guest) => (
                <tr key={guest.checkinInfo.checkinId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {guest.guestInfo.guestCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(guest.checkinInfo.checkinTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {guest.guestInfo.guestType}
                  </td>
                </tr>
              ))}
              {guests.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No check-ins recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
