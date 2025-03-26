import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { AuthService } from "@/services/auth.service";
import { User, AdminRegisterData, PocRegisterData } from "@/types/auth";

interface AuthState {
  user: User | null;
  pocId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  adminLogin: (email: string, password: string) => Promise<User>;
  pocLogin: (email: string, password: string) => Promise<User>;
  adminRegister: (data: AdminRegisterData) => Promise<User>;
  pocRegister: (data: PocRegisterData) => Promise<User>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        pocId: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        adminLogin: async (email: string, password: string) => {
          try {
            set({ isLoading: true, error: null });
            const response = await AuthService.adminLogin({ email, password });
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return response.user;
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
            set({
              user: response.user,
              pocId: response.pocId,
              isAuthenticated: true,
              isLoading: false,
            });
            return response.user;
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
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return response.user;
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
            set({
              user: response.user,
              pocId: response.pocId,
              isAuthenticated: true,
              isLoading: false,
            });
            return response.user;
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "Registration failed",
              isLoading: false,
            });
            throw error;
          }
        },

        logout: () => {
          set({ user: null, pocId: null, isAuthenticated: false, error: null });
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, pocId: state.pocId }),
        onRehydrateStorage: () => (state) => {
          console.log('hydration complete', state);
        },
      }
    ),
    {
      name: 'Auth Store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
