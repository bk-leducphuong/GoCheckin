'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/auth.service';
import { User, UserRole, AdminRegisterData, PocRegisterData } from '@/types/auth';

// Define Auth Context types
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<void>;
  pocLogin: (email: string, password: string) => Promise<void>;
  adminRegister: (data: AdminRegisterData) => Promise<void>;
  pocRegister: (data: PocRegisterData) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  adminLogin: async () => {},
  pocLogin: async () => {},
  adminRegister: async () => {},
  pocRegister: async () => {},
  logout: () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const token = AuthService.getToken();
        if (token) {
          // In a real app, you would decode the token here or fetch user info from the API
          // For now, just set a dummy user
          setUser({ email: 'user@example.com' });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Admin Login
  const adminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await AuthService.adminLogin({ email, password });
      setUser({ email, role: UserRole.ADMIN });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // POC Login
  const pocLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await AuthService.pocLogin({ email, password });
      setUser({ email, role: UserRole.POC });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Register
  const adminRegister = async (data: AdminRegisterData) => {
    setIsLoading(true);
    try {
      await AuthService.adminRegister(data);
      setUser({ email: data.email, role: UserRole.ADMIN });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // POC Register
  const pocRegister = async (data: PocRegisterData) => {
    setIsLoading(true);
    try {
      await AuthService.pocRegister(data);
      setUser({ email: data.email, role: UserRole.POC });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    adminLogin,
    pocLogin,
    adminRegister,
    pocRegister,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 