// Auth types

export enum UserRole {
  ADMIN = 'admin',
  POC = 'poc',
  USER = 'user'
}

export interface User {
  userId?: string;
  username?: string;
  email: string;
  role?: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  pocId?: string;
}

export interface AdminRegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  organizationName: string;
  organizationCode: string;
}

export interface PocRegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  eventCode: string;
  organizationName?: string;
  organizationCode?: string;
} 