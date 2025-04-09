import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { AuthService } from "@/services/auth.service";
import { AdminRegisterData, PocRegisterData } from "@/types/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  adminLogin: (email: string, password: string, deviceInfo?: string) => Promise<void>;
  pocLogin: (
    pocId: string,
    eventCode: string
  ) => Promise<{ pocId: string; eventCode: string }>;
  adminRegister: (data: AdminRegisterData) => Promise<void>;
  pocRegister: (data: PocRegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  refreshAccessToken: (deviceInfo?: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        adminLogin: async (email: string, password: string, deviceInfo?: string) => {
          try {
            set({ isLoading: true, error: null });
            const response = await AuthService.adminLogin({ email, password, deviceInfo });

            const newState = {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            };

            set(newState);
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Login failed",
              isLoading: false,
            });
            throw error;
          }
        },

        pocLogin: async (email: string, password: string) => {
          try {
            set({ isLoading: true, error: null });
            const response = await AuthService.pocLogin({ email, password });

            const newState = {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            };
            set(newState);

            if (!response.pocId || !response.eventCode) {
              throw new Error("Invalid response from server");
            }

            return {
              pocId: response.pocId,
              eventCode: response.eventCode,
            };
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Login failed",
              isLoading: false,
            });
            throw error;
          }
        },

        adminRegister: async (data: AdminRegisterData) => {
          try {
            set({ isLoading: true, error: null });
            const response = await AuthService.adminRegister(data);

            const newState = {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            };

            set(newState);
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "Registration failed",
              isLoading: false,
            });
            throw error;
          }
        },

        pocRegister: async (data: PocRegisterData) => {
          try {
            set({ isLoading: true, error: null });
            const response = await AuthService.pocRegister(data);

            const newState = {
              pocId: response.pocId,
              eventCode: response.eventCode,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            };

            set(newState);
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "Registration failed",
              isLoading: false,
            });
            throw error;
          }
        },

        logout: async () => {
          const { refreshToken } = get();
          if (refreshToken) {
            try {
              // Call the logout endpoint via AuthService
              await AuthService.logout(refreshToken);
            } catch (error) {
              console.error("Logout error:", error);
            }
          }
          // Clear the auth state regardless of API call success
          get().clearAuth();
        },

        clearAuth: () => {
          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        },

        setTokens: (accessToken: string, refreshToken: string) => {
          set({ accessToken, refreshToken });
        },

        refreshAccessToken: async (deviceInfo?: string) => {
          const { refreshToken } = get();
          if (!refreshToken) {
            get().clearAuth();
            return false;
          }

          try {
            const response = await AuthService.refreshToken(refreshToken, deviceInfo);

            const updatedState = {
              accessToken: response.accessToken,
            };

            set(updatedState);

            return true;
          } catch (error) {
            console.error("Token refresh error:", error);
            get().clearAuth();
            return false;
          }
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
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
