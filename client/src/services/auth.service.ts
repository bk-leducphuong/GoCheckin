import api from './api';
import { LoginCredentials, AuthResponse, AdminRegisterData, PocRegisterData, TokenRefreshResponse, SessionInfo, TokenPayload } from '@/types/auth';

const TOKEN_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'token';

// Auth Service for handling authentication operations
export const AuthService = {
  // Admin Authentication
  adminLogin: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/admin/login', credentials);
      return response.data.data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  },

  adminRegister: async (data: AdminRegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/admin/register', data);
      return response.data.data;
    } catch (error) {
      console.error('Admin registration error:', error);
      throw error;
    }
  },

  // POC Authentication
  pocLogin: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/poc/login', credentials);
      return response.data.data;
    } catch (error) {
      console.error('POC login error:', error);
      throw error;
    }
  },

  pocRegister: async (data: PocRegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/poc/register', data);
      return response.data.data;
    } catch (error) {
      console.error('POC registration error:', error);
      throw error;
    }
  },

  // Token Management
  refreshToken: async (refreshToken: string): Promise<TokenRefreshResponse> => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return response.data.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },

  verifyToken: async (): Promise<{ valid: boolean; user: TokenPayload }> => {
    try {
      const response = await api.post('/auth/verify');
      return response.data.data;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  },

  // Session Management
  getSessions: async (): Promise<SessionInfo[]> => {
    try {
      const response = await api.get('/auth/sessions');
      return response.data.data;
    } catch (error) {
      console.error('Get sessions error:', error);
      throw error;
    }
  },

  revokeSession: async (sessionId: string): Promise<{ success: boolean }> => {
    try {
      const response = await api.delete(`/auth/sessions/${sessionId}`);
      return response.data.data;
    } catch (error) {
      console.error('Revoke session error:', error);
      throw error;
    }
  },

  // Logout
  logout: async (refreshToken: string): Promise<{ success: boolean }> => {
    try {
      const response = await api.post('/auth/logout', { refreshToken });
      return response.data.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  logoutAll: async (): Promise<{ success: boolean }> => {
    try {
      const response = await api.post('/auth/logout-all');
      return response.data.data;
    } catch (error) {
      console.error('Logout all error:', error);
      throw error;
    }
  },

  // Common methods
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