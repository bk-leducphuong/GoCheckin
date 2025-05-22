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
import { GoogleAdminRegisterData } from "@/types/auth";
import GoogleAuthButton from "@/components/ui/GoogleAuthButton";
import { Divider } from "@/components/ui/Divider";

// Admin registration validation schema
const adminRegisterSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    phoneNumber: z.string().min(6, "Phone number is required"),
    tenantName: z.string(),
    tenantCode: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Google admin registration validation schema
const googleAdminRegisterSchema = z.object({
  tenantName: z.string().min(2, "Organization name is required"),
  tenantCode: z.string().min(3, "Organization code is required"),
  phoneNumber: z.string().min(6, "Phone number is required"),
});

type AdminRegisterFormData = z.infer<typeof adminRegisterSchema>;
type GoogleAdminRegisterFormData = z.infer<typeof googleAdminRegisterSchema>;

export default function TenantRegisterPage() {
  const [showGoogleForm, setShowGoogleForm] = useState(false);
  const [googleCode, setGoogleCode] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { adminRegister, adminGoogleRegister } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AdminRegisterFormData>({
    resolver: zodResolver(adminRegisterSchema),
  });

  const {
    register: registerGoogle,
    handleSubmit: handleGoogleSubmit,
    formState: { errors: googleErrors },
    setValue: setGoogleValue,
  } = useForm<GoogleAdminRegisterFormData>({
    resolver: zodResolver(googleAdminRegisterSchema),
  });

  useEffect(() => {
    const deviceInfo = navigator.userAgent;
    setDeviceInfo(deviceInfo);
  }, []);

  const onSubmit = async (data: AdminRegisterFormData) => {
    try {
      setIsLoading(true);
      const { confirmPassword, ...registerData } = data;
      void confirmPassword;
      await adminRegister({
        ...registerData,
        deviceInfo,
      });
      router.push("/admin");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    setGoogleCode(response.code);
    setShowGoogleForm(true);
  };

  const handleGoogleError = (error: any) => {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : "Failed to sign in with Google. Please try again."
    );
  };

  const onGoogleFormSubmit = async (data: GoogleAdminRegisterFormData) => {
    if (!googleCode) {
      setErrorMessage("Google authentication failed. Please try again.");
      return;
    }

    try {
      setErrorMessage(null);
      setIsGoogleLoading(true);

      const googleData: GoogleAdminRegisterData = {
        ...data,
        code: googleCode,
        deviceInfo,
      };

      await adminGoogleRegister(googleData);
      router.push("/admin");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Registration with Google failed. Please try again."
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Registration
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Create your admin account for GoCheckin
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        {!showGoogleForm ? (
          <>
            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              buttonText={"Register with Google"}
            />

            <div className="relative my-4">
              <Divider>or</Divider>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <Input
                  label="Username"
                  type="text"
                  {...register("username")}
                  error={errors.username?.message}
                  placeholder="johndoe"
                />

                <Input
                  label="Email"
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                  placeholder="your@email.com"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    type="password"
                    {...register("password")}
                    error={errors.password?.message}
                    placeholder="********"
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    {...register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                    placeholder="********"
                  />
                </div>

                <Input
                  label="Full Name"
                  type="text"
                  {...register("fullName")}
                  error={errors.fullName?.message}
                  placeholder="John Doe"
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  {...register("phoneNumber")}
                  error={errors.phoneNumber?.message}
                  placeholder="+1234567890"
                />

                <Input
                  label="Organization Name"
                  type="text"
                  {...register("tenantName")}
                  error={errors.tenantName?.message}
                  placeholder="Your Organization Ltd."
                />

                <div className="relative">
                  <Input
                    label="Organization Code"
                    type="text"
                    {...register("tenantCode")}
                    error={errors.tenantCode?.message}
                    placeholder="Your Organization Code"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const randomCode = `ORG-${Math.random()
                        .toString(36)
                        .substring(2, 8)
                        .toUpperCase()}`;
                      setValue("tenantCode", randomCode, {
                        shouldValidate: true,
                      });
                    }}
                    className="absolute right-2 top-9 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full">
                Register
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Log in
                  </Link>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Are you a POC?{" "}
                  <Link
                    href="/register/poc"
                    className="text-blue-600 hover:underline"
                  >
                    Register as POC
                  </Link>
                </p>
              </div>
            </form>
          </>
        ) : (
          <form
            className="mt-8 space-y-6"
            onSubmit={handleGoogleSubmit(onGoogleFormSubmit)}
          >
            <div className="space-y-4">
              <Input
                label="Phone Number"
                type="tel"
                {...registerGoogle("phoneNumber")}
                error={googleErrors.phoneNumber?.message}
                placeholder="+1234567890"
              />

              <Input
                label="Organization Name"
                type="text"
                {...registerGoogle("tenantName")}
                error={googleErrors.tenantName?.message}
                placeholder="Your Organization Ltd."
              />

              <div className="relative">
                <Input
                  label="Organization Code"
                  type="text"
                  {...registerGoogle("tenantCode")}
                  error={googleErrors.tenantCode?.message}
                  placeholder="Your Organization Code"
                />
                <button
                  type="button"
                  onClick={() => {
                    const randomCode = `ORG-${Math.random()
                      .toString(36)
                      .substring(2, 8)
                      .toUpperCase()}`;
                    setGoogleValue("tenantCode", randomCode, {
                      shouldValidate: true,
                    });
                  }}
                  className="absolute right-2 top-9 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isGoogleLoading}
              className="w-full"
            >
              Complete Google Registration
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => setShowGoogleForm(false)}
            >
              Back to Regular Registration
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
