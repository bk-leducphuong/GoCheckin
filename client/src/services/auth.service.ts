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
    const response = await api.post("/auth/admin/login", credentials);
    return response.data.data;
  },

  async adminRegister(data: AdminRegisterData): Promise<AuthResponse> {
    const response = await api.post("/auth/admin/register", data);
    return response.data.data;
  },

  // POC Authentication
  async pocLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post("/auth/poc/login", credentials);
    return response.data.data;
  },

  async pocRegister(data: PocRegisterData): Promise<AuthResponse> {
    const response = await api.post("/auth/poc/register", data);
    return response.data.data;
  },

  // Token Management
  async refreshToken(
    refreshToken: string,
    deviceInfo?: string
  ): Promise<TokenRefreshResponse> {
    const response = await api.post("/auth/refresh", {
      refreshToken,
      deviceInfo,
    });
    return response.data.data;
  },

  async verifyToken(): Promise<{ valid: boolean; user: TokenPayload }> {
    const response = await api.post("/auth/verify");
    return response.data.data;
  },

  // Session Management
  async getSessions(): Promise<SessionInfo[]> {
    const response = await api.get("/auth/sessions");
    return response.data.data;
  },

  async revokeSession(sessionId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data.data;
  },

  // Logout
  async logout(refreshToken: string): Promise<{ success: boolean }> {
    const response = await api.post("/auth/logout", { refreshToken });
    return response.data.data;
  },

  async logoutAll(): Promise<{ success: boolean }> {
    const response = await api.post("/auth/logout-all");
    return response.data.data;
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
