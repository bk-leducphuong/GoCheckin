import { UserRole } from "./user";

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
  deviceInfo?: string;
}

// Google OAuth credentials
export interface GoogleAuthCredentials {
  code: string;
  deviceInfo?: string;
}

// Auth response from API
export interface AuthResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  pointCode?: string;
  eventCode?: string;
}

// Admin registration data
export interface AdminRegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  tenantName: string;
  tenantCode: string;
  deviceInfo?: string;
}

// POC registration data
export interface PocRegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  deviceInfo?: string;
}

// Google registration data for admin
export interface GoogleAdminRegisterData {
  code: string;
  tenantName: string;
  tenantCode: string;
  phoneNumber: string;
  deviceInfo?: string;
}

// Google registration data for POC
export interface GooglePocRegisterData {
  code: string;
  deviceInfo?: string;
}

// Session information
export interface SessionInfo {
  id: string;
  deviceInfo: string;
  createdAt: string;
  expiresAt: string;
}

// Token payload
export interface TokenPayload {
  userId: string;
  role: UserRole;
}

// Token refresh response
export interface TokenRefreshResponse {
  accessToken: string;
  userId: string;
}

export interface VerifyAccessTokenResponse {
  valid: boolean;
  userId: string | null;
}
