"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useShallow } from "zustand/react/shallow";

// POC registration validation schema
const pocRegisterSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    eventCode: z.string().min(3, "Event code is required"),
    pointCode: z.string().min(3, "Point of checkin code is required"),
    companyName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PocRegisterFormData = z.infer<typeof pocRegisterSchema>;

export default function PocRegisterPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { pocRegister } = useAuthStore(
    useShallow((state) => ({
      pocRegister: state.pocRegister,
    }))
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PocRegisterFormData>({
    resolver: zodResolver(pocRegisterSchema),
  });

  const onSubmit = async (data: PocRegisterFormData) => {
    try {
      setErrorMessage(null);
      const { confirmPassword, ...registerData } = data;
      void confirmPassword;
      await pocRegister(registerData);
      router.push(`/poc`);
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">POC Registration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create your point of contact account for GoCheckin
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

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
              label="Event Code"
              type="text"
              {...register("eventCode")}
              error={errors.eventCode?.message}
              placeholder="EVENT123"
            />

            <Input
              label="Point of checkin Code"
              type="text"
              {...register("pointCode")}
              error={errors.pointCode?.message}
              placeholder="POINT123"
            />

            <Input
              label="Company Name (optional)"
              type="text"
              {...register("companyName")}
              error={errors.companyName?.message}
              placeholder="Your Company Ltd."
            />
          </div>

          <Button type="submit" isLoading={isSubmitting} className="w-full">
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
              Are you an Admin?{" "}
              <Link
                href="/register/tenant"
                className="text-blue-600 hover:underline"
              >
                Register as Admin
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
