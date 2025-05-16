"use client";

import { useCallback } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import Button from "./Button";
import { FcGoogle } from "react-icons/fc";

interface GoogleAuthButtonProps {
  onSuccess: (response: any) => void;
  onError?: (error: any) => void;
  className?: string;
  buttonText?: string;
  isLoading?: boolean;
}

export default function GoogleAuthButton({
  onSuccess,
  onError,
  className = "",
  buttonText = "Sign up with Google",
  isLoading = false,
}: GoogleAuthButtonProps) {
  const login = useGoogleLogin({
    onSuccess,
    onError,
    flow: "auth-code",
  });

  const handleGoogleLogin = useCallback(() => {
    login();
  }, [login]);

  return (
    <Button
      type="button"
      onClick={handleGoogleLogin}
      className={`flex items-center justify-center gap-2 w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 ${className}`}
      variant="outline"
      isLoading={isLoading}
    >
      {!isLoading && <FcGoogle className="w-5 h-5" />}
      {buttonText}
    </Button>
  );
}
