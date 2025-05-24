"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/poc/authStore";
import { useShallow } from "zustand/react/shallow";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { ApiError } from "@/lib/error";

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { logout } = useAuthStore(
    useShallow((state) => ({
      logout: state.logout,
    }))
  );

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you would save this preference
    setSuccessMessage("Display settings updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleToggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
    // In a real app, you would save this preference
    setSuccessMessage("Notification settings updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      router.push("/login/poc");
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {successMessage && (
          <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        <div className="space-y-8">
          {/* Display Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">
              Display Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Dark Mode</h3>
                  <p className="text-sm text-gray-500">
                    Enable dark mode for the application
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isDarkMode}
                    onChange={handleToggleDarkMode}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">
              Notification Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive email notifications about event updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={emailNotifications}
                    onChange={handleToggleEmailNotifications}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">
              Account
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Sign Out</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Sign out from your account
                </p>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
