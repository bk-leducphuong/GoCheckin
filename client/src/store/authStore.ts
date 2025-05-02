import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { AuthService } from "@/services/auth.service";
import { AdminRegisterData, PocRegisterData } from "@/types/auth";
import { UserRole } from "@/types/user";

interface AuthState {
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
    password: string
  ) => Promise<{ pointCode: string; eventCode: string }>;
  adminRegister: (data: AdminRegisterData) => Promise<void>;
  pocRegister: (
    data: PocRegisterData
  ) => Promise<{ pointCode: string; eventCode: string }>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  verifyAccessToken: (role: UserRole) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
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
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          };

          set(newState);
        },

        pocLogin: async (email: string, password: string) => {
          const response = await AuthService.pocLogin({ email, password });

          const newState = {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          };
          set(newState);

          if (!response.pointCode || !response.eventCode) {
            throw new Error("Invalid response from server");
          }

          return {
            pointCode: response.pointCode,
            eventCode: response.eventCode,
          };
        },

        adminRegister: async (data: AdminRegisterData) => {
          const response = await AuthService.adminRegister(data);

          const newState = {
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
            pointCode: response.pointCode,
            eventCode: response.eventCode,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
          };

          set(newState);
          if (!response.pointCode || !response.eventCode) {
            throw new Error("Invalid response from server");
          }

          return {
            pointCode: response.pointCode,
            eventCode: response.eventCode,
          };
        },

        logout: async () => {
          const { refreshToken } = get();
          if (refreshToken) {
            // Call the logout endpoint via AuthService
            await AuthService.logout(refreshToken);
          }
          // Clear the auth state regardless of API call success
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

        verifyAccessToken: async (role: UserRole, deviceInfo?: string) => {
          const { accessToken, refreshToken } = get();
          if (accessToken) {
            const isValid = await AuthService.verifyAccessToken(role);
            if (isValid) {
              set({
                isAuthenticated: true,
              });
              return;
            } else {
              if (refreshToken) {
                const response = await AuthService.refreshAccessToken(
                  refreshToken,
                  deviceInfo
                );

                set({
                  accessToken: response.accessToken,
                  isAuthenticated: true,
                });
                return;
              }
            }
          }
          get().clearAuth();
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
