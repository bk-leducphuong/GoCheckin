"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/admin/authStore";
import { useShallow } from "zustand/react/shallow";
import { FaCalendar, FaUser } from "react-icons/fa";
import { FaCog } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { ApiError } from "@/lib/error";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuthStore(
    useShallow((state) => ({
      logout: state.logout,
    }))
  );

  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "GoCheckin";

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    try {
      setIsLoading(true);
      logout();
      router.push("/login/admin");
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : "Failed to logout. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  const navItems: NavItem[] = [
    {
      name: "Events",
      path: "/admin/events",
      icon: <FaCalendar className="w-5 h-5" />,
    },
    {
      name: "Analysis",
      path: "/admin/analysis",
      icon: <FaChartLine className="w-5 h-5" />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <FaCog className="w-5 h-5" />,
    },
    {
      name: "Profile",
      path: "/admin/profile",
      icon: <FaUser className="w-5 h-5" />,
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: <FaBell className="w-5 h-5" />,
    },
  ];

  return (
    <div
      className={`bg-white shadow-md transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header with logo and toggle button */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          {!collapsed && (
            <Link href="/admin" className="text-xl font-bold text-blue-600">
              {APP_NAME}
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 focus:outline-none"
          >
            {!collapsed ? (
              <MdKeyboardDoubleArrowLeft className="w-6 h-6 text-gray-600" />
            ) : (
              <MdKeyboardDoubleArrowRight className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.path || pathname?.startsWith(item.path + "/");
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="mr-3 flex-shrink-0">{item.icon}</div>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-2 border-t mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-700 rounded-md hover:bg-red-100 transition-colors"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
