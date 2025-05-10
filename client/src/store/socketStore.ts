import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./authStore";
import { CheckInResponse } from "@/types/checkin";

interface SocketStore {
  socket: Socket | null;
  isSocketConnected: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  registerAdmin: (eventCode: string) => void;
  unregisterAdmin: (eventCode: string) => void;
  connectToAdmin: (eventCode: string, pointCode: string) => void;
  disconnectFromAdmin: (eventCode: string, pointCode: string) => void;
  sendCheckinSocketEvent: (checkinData: CheckInResponse) => void;
}

export const useSocketStore = create<SocketStore>()(
  devtools(
    (set, get) => ({
      socket: null,
      isSocketConnected: false,
      connect: () => {
        return new Promise((resolve, reject) => {
          try {
            const authStore = useAuthStore.getState();
            const token = authStore.accessToken;

            if (token) {
              const socket = io(
                process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000",
                {
                  auth: {
                    token: `Bearer ${token}`,
                  },
                }
              );
              socket.on("connect", () => {
                console.log("Socket connected");
                set({ socket: socket, isSocketConnected: true });
                resolve(true);
              });

              socket.on("disconnect", () => {
                console.log("Socket disconnected");
                set({ socket: null, isSocketConnected: false });
              });

              socket.on("connect_error", (error) => {
                if (get().isSocketConnected) {
                  get().disconnect();
                }
                reject(error);
              });
            } else {
              throw new Error("No token found");
            }
          } catch (error) {
            console.error("Error connecting to socket:", error);
            reject(error);
          }
        });
      },
      disconnect: () => {
        const socket = get().socket;
        if (!socket || !get().isSocketConnected) return;

        try {
          socket.disconnect();
        } catch (error) {
          console.error("Error disconnecting from socket:", error);
          throw error;
        }
      },
      registerAdmin: (eventCode: string) => {
        const socket = get().socket;
        if (!socket || !get().isSocketConnected) return;

        try {
          socket.emit("register_admin", eventCode);
        } catch (error) {
          console.error("Error registering admin:", error);
          throw error;
        }
      },
      unregisterAdmin: (eventCode: string) => {
        const socket = get().socket;
        if (!socket || !get().isSocketConnected) return;

        try {
          socket.emit("unregister_admin", eventCode);
        } catch (error) {
          console.error("Error unregistering admin:", error);
          throw error;
        }
      },
      sendCheckinSocketEvent: (checkinData: CheckInResponse) => {
        const socket = get().socket;
        if (!socket || !get().isSocketConnected) return;

        try {
          socket.emit("new_checkin", checkinData);
        } catch (error) {
          console.error("Error checking in guest:", error);
          throw error;
        }
      },
      connectToAdmin: (eventCode: string, pointCode: string) => {
        const socket = get().socket;
        if (!socket || !get().isSocketConnected) return;

        socket.emit("connect_to_admin", { eventCode, pointCode });
      },
      disconnectFromAdmin: (eventCode: string, pointCode: string) => {
        const socket = get().socket;
        if (!socket || !get().isSocketConnected) return;
        socket.emit("disconnect_from_admin", { eventCode, pointCode });
      },
    }),
    {
      name: "Socket Store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
