"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AuthService } from "@/services/auth.service";
import { UserRole } from "@/types/user";
import { TokenPayload } from "@/types/auth";
import { useShallow } from "zustand/shallow";

interface AuthCheckProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * A component that checks if the user is authenticated and has the correct role
 * If not, redirects to the specified page or shows a fallback component
 * Automatically handles token refresh if needed
 */
export default function AuthCheck({
  children,
  allowedRoles = [],
  redirectTo = "/login",
  fallback,
}: AuthCheckProps) {
  const router = useRouter();
  const { accessToken, clearAuth, refreshAccessToken } =
    useAuthStore(
      useShallow((state) => ({
        accessToken: state.accessToken,
        clearAuth: state.clearAuth,
        refreshAccessToken: state.refreshAccessToken,
      }))
    );

  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<TokenPayload | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (accessToken) {
        try {
          const response = await AuthService.verifyToken();
          if (!response.valid) {
            const deviceInfo = navigator.userAgent;
            await refreshAccessToken(deviceInfo);
          }
          if (!response.user) {
            throw new Error("User not found");
          }
          setUser(response.user);
        } catch (error) {
          console.error("Error verifying token:", error);
          clearAuth();
          router.push(redirectTo);
        } finally {
          setIsValidating(false);
        }
      } else {
        setIsValidating(false);
      }
    };

    verifyToken();
  }, [
    accessToken,
    refreshAccessToken,
    clearAuth,
    router,
    redirectTo,
  ]);

  // Authorization check effect
  useEffect(() => {
    if (user && user.role && allowedRoles.includes(user.role)) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [user, allowedRoles]);

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized && fallback) {
    return <>{fallback}</>;
  }

  return isAuthorized ? <>{children}</> : null;
}
