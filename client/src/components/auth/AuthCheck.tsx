"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/user";
import { useShallow } from "zustand/shallow";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import AuthenticationFail from "@/components/ui/AuthenticationFail";

interface AuthCheckProps {
  children: React.ReactNode;
  allowedRoles?: UserRole;
  redirectTo?: string;
}

export default function AuthCheck({
  children,
  allowedRoles,
  redirectTo = "/login",
}: AuthCheckProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, verifyAccessToken } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      verifyAccessToken: state.verifyAccessToken,
    }))
  );

  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsLoading(true);
        await verifyAccessToken(allowedRoles as UserRole);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setError("System is having issues. Please try again later.");
        console.error("Error verifying access token:", error);
      }
    };
    verifyToken();
  }, [isAuthenticated, verifyAccessToken, allowedRoles]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo={redirectTo} />;
  }

  if (!isAuthenticated) {
    return <AuthenticationFail />;
  }

  return <>{children}</>;
}
