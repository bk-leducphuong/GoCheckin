"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { AuthService } from "@/services/admin/auth.service";
import { ApiError } from "@/lib/error";
// Step 1: Request OTP validation schema
const requestOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Step 2: Verify OTP validation schema
const verifyOtpSchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters"),
});

// Step 3: Reset Password validation schema
const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RequestOtpFormData = z.infer<typeof requestOtpSchema>;
type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Steps enum
enum ForgotPasswordStep {
  REQUEST_OTP,
  VERIFY_OTP,
  RESET_PASSWORD,
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>(
    ForgotPasswordStep.REQUEST_OTP
  );
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Request OTP form
  const {
    register: registerRequestOtp,
    handleSubmit: handleSubmitRequestOtp,
    formState: { errors: errorsRequestOtp },
  } = useForm<RequestOtpFormData>({
    resolver: zodResolver(requestOtpSchema),
  });

  // Verify OTP form
  const {
    register: registerVerifyOtp,
    handleSubmit: handleSubmitVerifyOtp,
    formState: { errors: errorsVerifyOtp },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
  });

  // Reset Password form
  const {
    register: registerResetPassword,
    handleSubmit: handleSubmitResetPassword,
    formState: { errors: errorsResetPassword },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onRequestOtp = async (data: RequestOtpFormData) => {
    setIsLoading(true);
    try {
      await AuthService.requestResetPassword(data.email);
      setEmail(data.email);
      setCurrentStep(ForgotPasswordStep.VERIFY_OTP);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to send verification code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async (data: VerifyOtpFormData) => {
    setIsLoading(true);
    try {
      const { userId, resetToken } = await AuthService.verifyOtp(
        email,
        data.otp
      );
      if (!userId || !resetToken) {
        setErrorMessage("Invalid or expired code. Please try again.");
        return;
      }
      setUserId(userId);
      setResetToken(resetToken);

      setCurrentStep(ForgotPasswordStep.RESET_PASSWORD);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Invalid or expired code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      if (!userId || !resetToken) {
        setErrorMessage("Invalid or expired code. Please try again.");
        return;
      }

      await AuthService.resetPassword(userId, resetToken, data.password);
      router.push("/login/admin");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            {currentStep === ForgotPasswordStep.REQUEST_OTP &&
              "Enter your email to receive a verification code"}
            {currentStep === ForgotPasswordStep.VERIFY_OTP &&
              "Enter the verification code sent to your email"}
            {currentStep === ForgotPasswordStep.RESET_PASSWORD &&
              "Create a new password for your account"}
          </p>
        </div>

        {currentStep === ForgotPasswordStep.REQUEST_OTP && (
          <form
            onSubmit={handleSubmitRequestOtp(onRequestOtp)}
            className="space-y-6"
          >
            <Input
              label="Email"
              type="email"
              {...registerRequestOtp("email")}
              error={errorsRequestOtp.email?.message}
              placeholder="your@email.com"
            />
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}

            <Button type="submit" isLoading={isLoading} className="w-full">
              Send Verification Code
            </Button>
          </form>
        )}

        {currentStep === ForgotPasswordStep.VERIFY_OTP && (
          <form
            onSubmit={handleSubmitVerifyOtp(onVerifyOtp)}
            className="space-y-6"
          >
            <div>
              <p className="text-sm text-gray-500 mb-4">
                We sent a verification code to {email} if this email is
                registered.
              </p>
              <Input
                label="Verification Code"
                type="text"
                {...registerVerifyOtp("otp")}
                error={errorsVerifyOtp.otp?.message}
                placeholder="Enter verification code"
              />
              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Verify Code
            </Button>

            <button
              type="button"
              onClick={() => setCurrentStep(ForgotPasswordStep.REQUEST_OTP)}
              className="text-sm text-blue-600 hover:text-blue-500 w-full text-center"
            >
              Try with a different email
            </button>
          </form>
        )}

        {currentStep === ForgotPasswordStep.RESET_PASSWORD && (
          <form
            onSubmit={handleSubmitResetPassword(onResetPassword)}
            className="space-y-6"
          >
            <Input
              label="New Password"
              type="password"
              {...registerResetPassword("password")}
              error={errorsResetPassword.password?.message}
              placeholder="********"
            />

            <Input
              label="Confirm New Password"
              type="password"
              {...registerResetPassword("confirmPassword")}
              error={errorsResetPassword.confirmPassword?.message}
              placeholder="********"
            />

            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}

            <Button type="submit" isLoading={isLoading} className="w-full">
              Reset Password
            </Button>
          </form>
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
