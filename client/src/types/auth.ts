// User roles
export enum UserRole {
  ADMIN = 'admin',
  POC = 'poc',
  USER = 'user'
}

// User interface
export interface User {
  userId: string;
  username?: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Auth response from API
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  pocId?: string;
  eventCode?: string;
}

// Admin registration data
export interface AdminRegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
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
  confirmPassword?: string;
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
  username?: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Token refresh response
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
} 