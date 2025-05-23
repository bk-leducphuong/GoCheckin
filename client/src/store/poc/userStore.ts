import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { UserService } from "@/services/poc/user.service";
import { User } from "@/types/user";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  getUser: () => Promise<User>;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,
        error: null,

        getUser: async () => {
          try {
            set({ isLoading: true, error: null });
            const user = await UserService.getUser();
            set({ user: user, isLoading: false });
            return user;
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Error fetching user data",
              isLoading: false,
            });
            throw error;
          }
        },
      }),
      {
        name: "user-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            console.log("User state hydration complete");
          } else {
            console.error("Failed to rehydrate user state");
          }
        },
        version: 1, // increment this when the storage structure changes
      }
    ),
    {
      name: "User Store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
