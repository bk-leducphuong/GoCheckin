"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/poc/authStore";
import { useUserStore } from "@/store/poc/userStore";
import { useShallow } from "zustand/react/shallow";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { userId } = useAuthStore(
    useShallow((state) => ({
      userId: state.userId,
    }))
  );

  const { user, getUser } = useUserStore(
    useShallow((state) => ({
      user: state.user,
      getUser: state.getUser,
    }))
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        if (userId) {
          await getUser();
        } else {
          setError("Authentication error");
        }
      } catch (error: unknown) {
        setError(
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, getUser]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Account Profile</h1>

        <div className="space-y-6">
          {/* Profile Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="text-gray-900 bg-gray-100 p-2 rounded">
                  {user?.username || "Not set"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="text-gray-900 bg-gray-100 p-2 rounded">
                  {user?.fullName || "Not set"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="text-gray-900 bg-gray-100 p-2 rounded">
                  {user?.email || "Not set"}
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">
              Account Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <div className="text-gray-900 bg-gray-100 p-2 rounded">
                  {userId || "Not available"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="text-gray-900 bg-gray-100 p-2 rounded">
                  {user?.role || "Not available"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
