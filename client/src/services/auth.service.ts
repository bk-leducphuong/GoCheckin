import api from './api';
import { LoginCredentials, AuthResponse, AdminRegisterData, PocRegisterData } from '@/types/auth';

const TOKEN_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'token';

// Auth Service for handling authentication operations
export const AuthService = {
  // Admin Authentication
  adminLogin: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/admin/login', credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseData = response.data.data;
      // Store token in localStorage
      if (responseData.accessToken) {
        localStorage.setItem(TOKEN_NAME, responseData.accessToken);
      }
      return responseData;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  },

  adminRegister: async (data: AdminRegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/admin/register', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseData = response.data.data;
      // Store token in localStorage
      if (responseData.accessToken) {
        localStorage.setItem(TOKEN_NAME, responseData.accessToken);
      }
      return responseData;
    } catch (error) {
      console.error('Admin registration error:', error);
      throw error;
    }
  },

  // POC Authentication
  pocLogin: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/poc/login', credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseData = response.data.data;
      // Store token in localStorage
      if (responseData.accessToken) {
        localStorage.setItem(TOKEN_NAME, responseData.accessToken);
      }
      return responseData;
    } catch (error) {
      console.error('POC login error:', error);
      throw error;
    }
  },

  pocRegister: async (data: PocRegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/poc/register', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseData = response.data.data;
      // Store token in localStorage
      if (responseData.accessToken) {
        localStorage.setItem(TOKEN_NAME, responseData.accessToken);
      }
      return responseData;
    } catch (error) {
      console.error('POC registration error:', error);
      throw error;
    }
  },

  // Common methods
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_NAME);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_NAME);
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!AuthService.getToken();
  }
}; 