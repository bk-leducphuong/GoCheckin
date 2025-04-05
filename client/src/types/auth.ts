import { UserRole } from "./user";

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Auth response from API
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  pocId?: string;
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
}

// POC registration data
export interface PocRegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  eventCode: string;
  pointCode: string;
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
  refreshToken: string;
} 