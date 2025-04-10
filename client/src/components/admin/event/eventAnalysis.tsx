"use client";

import React from "react";
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
import { Line, Bar, Pie } from "react-chartjs-2";

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

// Sample check-in timeline data (last 8 hours)
const checkInData = [
  { timestamp: "2025-04-11T09:00:00", count: 15 },
  { timestamp: "2025-04-11T10:00:00", count: 25 },
  { timestamp: "2025-04-11T11:00:00", count: 45 },
  { timestamp: "2025-04-11T12:00:00", count: 30 },
  { timestamp: "2025-04-11T13:00:00", count: 20 },
  { timestamp: "2025-04-11T14:00:00", count: 35 },
  { timestamp: "2025-04-11T15:00:00", count: 40 },
  { timestamp: "2025-04-11T16:00:00", count: 25 },
];

// Sample guest type distribution data
const guestTypeData = [
  { type: "VIP", count: 50 },
  { type: "Regular", count: 150 },
  { type: "Student", count: 75 },
  { type: "Press", count: 25 },
];

// Sample check-in points performance data
const checkInPointData = [
  { pointName: "Main Entrance", checkedIn: 120, total: 150 },
  { pointName: "Side Gate", checkedIn: 80, total: 100 },
  { pointName: "VIP Entry", checkedIn: 45, total: 50 },
];

export default function EventAnalysis({ eventCode }: { eventCode: string }) {
  // Check-in timeline data
  const timelineData = {
    labels: checkInData.map((d) => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Check-ins",
        data: checkInData.map((d) => d.count),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        fill: false,
      },
    ],
  };

  // Guest type distribution data
  const guestTypeChartData = {
    labels: guestTypeData.map((d) => d.type),
    datasets: [
      {
        data: guestTypeData.map((d) => d.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
        ],
      },
    ],
  };

  // Check-in points performance data
  const checkInPointsData = {
    labels: checkInPointData.map((d) => d.pointName),
    datasets: [
      {
        label: "Checked In",
        data: checkInPointData.map((d) => d.checkedIn),
        backgroundColor: "rgba(75, 192, 192, 0.8)",
      },
      {
        label: "Total Expected",
        data: checkInPointData.map((d) => d.total),
        backgroundColor: "rgba(255, 206, 86, 0.8)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Check-in Timeline */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Check-in Timeline</h3>
          <div className="h-[300px]">
            <Line data={timelineData} options={chartOptions} />
          </div>
        </div>

        {/* Guest Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Guest Type Distribution
          </h3>
          <div className="h-[300px]">
            <Pie data={guestTypeChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Check-in Points Performance */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          Check-in Points Performance
        </h3>
        <div className="h-[300px]">
          <Bar data={checkInPointsData} options={chartOptions} />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-500">Total Check-ins</h4>
          <p className="text-2xl font-bold text-gray-900">
            {checkInData.reduce((sum, d) => sum + d.count, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-500">Total Expected</h4>
          <p className="text-2xl font-bold text-gray-900">
            {checkInPointData.reduce((sum, d) => sum + d.total, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-500">Check-in Rate</h4>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(
              (checkInPointData.reduce((sum, d) => sum + d.checkedIn, 0) /
                checkInPointData.reduce((sum, d) => sum + d.total, 0)) *
                100
            )}
            %
          </p>
        </div>
      </div>
    </div>
  );
}
