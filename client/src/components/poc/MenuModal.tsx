import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useShallow } from "zustand/react/shallow";

interface MenuModalProps {
  onClose: () => void;
}

export default function MenuModal({ onClose }: MenuModalProps) {
  const pointCode = useSearchParams().get("pointCode") as string;
  const eventCode = useSearchParams().get("eventCode") as string;

  const router = useRouter();
  const { logout } = useAuthStore(
    useShallow((state) => ({
      logout: state.logout,
    }))
  );

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 z-10 h-screen w-screen bg-transparent bg-opacity-50"
        onClick={onClose}
      />
      <div className="fixed top-16 right-4 z-20 w-56 bg-white rounded-md shadow-lg py-1">
        <div className="px-4 py-2 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">Account Menu</p>
        </div>

        <div className="py-1">
          <button
            onClick={() =>
              handleNavigate(
                `/poc/profile?pointCode=${pointCode}&eventCode=${eventCode}`
              )
            }
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Profile
          </button>

          <button
            onClick={() =>
              handleNavigate(
                `/poc/settings?pointCode=${pointCode}&eventCode=${eventCode}`
              )
            }
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </button>
        </div>

        <div className="border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
