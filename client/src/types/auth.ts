// Auth types

export enum UserRole {
  ADMIN = 'ADMIN',
  POC = 'POC',
  USER = 'USER'
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
}

export interface AdminRegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  companyName?: string;
}

export interface PocRegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  eventCode: string;
  companyName?: string;
} 