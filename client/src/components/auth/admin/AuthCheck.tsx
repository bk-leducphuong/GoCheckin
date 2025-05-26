"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/admin/authStore";
import { UserRole } from "@/types/user";
import { useShallow } from "zustand/shallow";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import AuthenticationFail from "@/components/ui/AuthenticationFail";
import { ApiError } from "@/lib/error";

interface AuthCheckProps {
  children: React.ReactNode;
  allowedRoles?: UserRole;
  redirectTo?: string;
}

export default function AuthCheck({
  children,
  allowedRoles,
  redirectTo = "/login/admin",
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
      } catch (error) {
        setError(
          error instanceof ApiError
            ? error.message
            : "Something went wrong when verifying token"
        );
      } finally {
        setIsLoading(false);
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
