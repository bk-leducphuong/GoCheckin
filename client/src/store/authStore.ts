import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { AuthService } from "@/services/auth.service";
import {
  AdminRegisterData,
  PocRegisterData,
  GoogleAdminRegisterData,
  GooglePocRegisterData,
} from "@/types/auth";
import { UserRole } from "@/types/user";
import { ApiError } from "@/lib/error";

interface AuthState {
  userId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  adminLogin: (
    email: string,
    password: string,
    deviceInfo?: string
  ) => Promise<void>;
  pocLogin: (
    email: string,
    password: string,
    deviceInfo?: string
  ) => Promise<void>;
  adminRegister: (data: AdminRegisterData) => Promise<void>;
  pocRegister: (data: PocRegisterData) => Promise<void>;
  adminGoogleLogin: (code: string, deviceInfo?: string) => Promise<void>;
  pocGoogleLogin: (code: string, deviceInfo?: string) => Promise<void>;
  adminGoogleRegister: (data: GoogleAdminRegisterData) => Promise<void>;
  pocGoogleRegister: (data: GooglePocRegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  verifyAccessToken: (role: UserRole) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        userId: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,

        adminLogin: async (
          email: string,
          password: string,
          deviceInfo?: string
        ) => {
          const response = await AuthService.adminLogin({
            email,
            password,
            deviceInfo,
          });

          const newState = {
            userId: response.userId,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          };

          set(newState);
        },

        pocLogin: async (
          email: string,
          password: string,
          deviceInfo?: string
        ) => {
          const response = await AuthService.pocLogin({
            email,
            password,
            deviceInfo,
          });

          const newState = {
            userId: response.userId,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          };
          set(newState);
        },

        adminRegister: async (data: AdminRegisterData) => {
          const response = await AuthService.adminRegister(data);

          const newState = {
            userId: response.userId,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          };

          set(newState);
        },

        pocRegister: async (data: PocRegisterData) => {
          const response = await AuthService.pocRegister(data);

          const newState = {
            userId: response.userId,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
          };

          set(newState);
        },

        adminGoogleLogin: async (code: string, deviceInfo?: string) => {
          try {
            const response = await AuthService.adminGoogleLogin({
              code,
              deviceInfo,
            });

            set({
              userId: response.userId,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
            });
          } catch (error) {
            throw error;
          }
        },

        pocGoogleLogin: async (code: string, deviceInfo?: string) => {
          try {
            const response = await AuthService.pocGoogleLogin({
              code,
              deviceInfo,
            });

            set({
              userId: response.userId,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
            });
          } catch (error) {
            throw error;
          }
        },

        adminGoogleRegister: async (data: GoogleAdminRegisterData) => {
          try {
            const response = await AuthService.adminGoogleRegister(data);

            set({
              userId: response.userId,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
            });
          } catch (error) {
            throw error;
          }
        },

        pocGoogleRegister: async (data: GooglePocRegisterData) => {
          try {
            const response = await AuthService.pocGoogleRegister(data);

            set({
              userId: response.userId,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
            });
          } catch (error) {
            throw error;
          }
        },

        logout: async () => {
          const { refreshToken } = get();
          if (refreshToken) {
            await AuthService.logout(refreshToken);
          }
          get().clearAuth();
        },

        clearAuth: () => {
          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        },

        setTokens: (accessToken: string, refreshToken: string) => {
          set({ accessToken, refreshToken });
        },
        refreshAccessToken: async () => {
          const { refreshToken } = get();
          if (refreshToken) {
            const response = await AuthService.refreshAccessToken(refreshToken);
            set({
              accessToken: response.accessToken,
              isAuthenticated: true,
              userId: response.userId,
            });
          }
        },

        verifyAccessToken: async (role: UserRole, deviceInfo?: string) => {
          try {
            const { accessToken } = get();
            if (accessToken) {
              const { valid, userId } = await AuthService.verifyAccessToken(
                role
              );
              if (valid) {
                set({
                  userId: userId,
                  isAuthenticated: true,
                });
              } else {
                get().refreshAccessToken();
              }
            } else {
              get().clearAuth();
            }
          } catch (error) {
            if (error instanceof ApiError && error.isAuthError()) {
              // Try to refresh access token
              get().refreshAccessToken();
            } else {
              get().clearAuth();
            }
          }
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            console.log("Auth state hydration complete");
          } else {
            console.error("Failed to rehydrate auth state");
          }
        },
        version: 1, // increment this when the storage structure changes
      }
    ),
    {
      name: "Auth Store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
