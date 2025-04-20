import api from "./api";
import {
  LoginCredentials,
  AuthResponse,
  AdminRegisterData,
  PocRegisterData,
  TokenRefreshResponse,
  SessionInfo,
  TokenPayload,
} from "@/types/auth";

const TOKEN_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "token";

// Auth Service for handling authentication operations
export const AuthService = {
  // Admin Authentication
  async adminLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/admin/login", credentials);
      return response.data.data;
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    }
  },

  async adminRegister(data: AdminRegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/admin/register", data);
      return response.data.data;
    } catch (error) {
      console.error("Admin registration error:", error);
      throw error;
    }
  },

  // POC Authentication
  async pocLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/poc/login", credentials);
      return response.data.data;
    } catch (error) {
      console.error("POC login error:", error);
      throw error;
    }
  },

  async pocRegister(data: PocRegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/poc/register", data);
      return response.data.data;
    } catch (error) {
      console.error("POC registration error:", error);
      throw error;
    }
  },

  // Token Management
  async refreshToken(
    refreshToken: string,
    deviceInfo?: string
  ): Promise<TokenRefreshResponse> {
    try {
      const response = await api.post("/auth/refresh", {
        refreshToken,
        deviceInfo,
      });
      return response.data.data;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  },

  async verifyToken(): Promise<{ valid: boolean; user: TokenPayload }> {
    try {
      const response = await api.post("/auth/verify");
      return response.data.data;
    } catch (error) {
      console.error("Token verification error:", error);
      throw error;
    }
  },

  // Session Management
  async getSessions(): Promise<SessionInfo[]> {
    try {
      const response = await api.get("/auth/sessions");
      return response.data.data;
    } catch (error) {
      console.error("Get sessions error:", error);
      throw error;
    }
  },

  async revokeSession(sessionId: string): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(`/auth/sessions/${sessionId}`);
      return response.data.data;
    } catch (error) {
      console.error("Revoke session error:", error);
      throw error;
    }
  },

  // Logout
  async logout(refreshToken: string): Promise<{ success: boolean }> {
    try {
      const response = await api.post("/auth/logout", { refreshToken });
      return response.data.data;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  async logoutAll(): Promise<{ success: boolean }> {
    try {
      const response = await api.post("/auth/logout-all");
      return response.data.data;
    } catch (error) {
      console.error("Logout all error:", error);
      throw error;
    }
  },

  // Common methods
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_NAME);
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!AuthService.getToken();
  },

  async requestResetPassword(email: string): Promise<{ message: string }> {
    const response = await api.post("/auth/request-reset-password", {
      email,
    });

    return response.data.data;
  },

  async verifyOtp(
    email: string,
    otp: string
  ): Promise<{ userId: string; resetToken: string }> {
    const response = await api.post("/auth/verify-otp", {
      email,
      otp,
    });

    return response.data.data;
  },

  async resetPassword(userId: string, resetToken: string, password: string) {
    await api.post("/auth/reset-password", {
      userId,
      resetToken,
      password,
    });
  },
};
