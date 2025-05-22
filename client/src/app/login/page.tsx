"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useShallow } from "zustand/react/shallow";
import GoogleAuthButton from "@/components/ui/GoogleAuthButton";
import { Divider } from "@/components/ui/Divider";

// Login validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  userType: z.enum(["admin", "poc"], {
    required_error: "Please select a user type",
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<string>();

  const router = useRouter();
  const { adminLogin, pocLogin, adminGoogleLogin, pocGoogleLogin } =
    useAuthStore(
      useShallow((state) => ({
        adminLogin: state.adminLogin,
        pocLogin: state.pocLogin,
        adminGoogleLogin: state.adminGoogleLogin,
        pocGoogleLogin: state.pocGoogleLogin,
      }))
    );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userType: "admin",
    },
  });

  const selectedUserType = watch("userType");

  useEffect(() => {
    const deviceInfo = navigator.userAgent;
    setDeviceInfo(deviceInfo);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage(null);

      setIsLoading(true);
      if (data.userType === "admin") {
        await adminLogin(data.email, data.password, deviceInfo);
        router.push("/admin");
      } else {
        await pocLogin(data.email, data.password, deviceInfo);
        router.push(`/poc`);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Login failed. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      if (selectedUserType === "admin") {
        await adminGoogleLogin(response.code, deviceInfo);
      } else {
        await pocGoogleLogin(response.code, deviceInfo);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google. Please try again."
      );
    }
  };

  const handleGoogleError = (error: any) => {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : "Failed to sign in with Google. Please try again."
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your GoCheckin account
          </p>
        </div>

        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          buttonText={"Login with Google"}
        />

        <div className="relative my-4">
          <Divider>or</Divider>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <div className="space-y-4">
            <div className="flex gap-4 border border-gray-300 rounded-md p-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="admin"
                  {...register("userType")}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="poc"
                  {...register("userType")}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">POC</span>
              </label>
            </div>
            {errors.userType && (
              <p className="mt-1 text-sm text-red-600">
                {errors.userType.message}
              </p>
            )}

            <Input
              autoComplete="off"
              label="Email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="your@email.com"
            />

            <Input
              autoComplete="off"
              label="Password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
              placeholder="********"
            />

            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            {selectedUserType === "admin" ? "Login as Admin" : "Login as POC"}
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              <Link href="/forgot-password" className="text-blue-600">
                Forgot your password?
              </Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              {selectedUserType === "admin" ? (
                <Link
                  href="/register/tenant"
                  className="text-blue-600 hover:underline"
                >
                  Register as Admin
                </Link>
              ) : (
                <Link
                  href="/register/poc"
                  className="text-blue-600 hover:underline"
                >
                  Register as POC
                </Link>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
