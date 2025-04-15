import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { io, Socket } from "socket.io-client";

interface SocketStore {
  socket: Socket | null;
  isSocketConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  leaveRoom: (eventCode: string) => void;
  joinRoom: (eventCode: string) => void;
}

export const useSocketStore = create<SocketStore>()(
  devtools(
    (set, get) => ({
      socket: null,
      isSocketConnected: false,
      connect: () => {
        try {
          const socket = io(
            process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000"
          );

          socket.on("connect", () => {
            console.log("Socket connected");
            set({ isSocketConnected: true });
          });
          
          socket.on("disconnect", () => {
            console.log("Socket disconnected");
            set({ isSocketConnected: false });
          });

          socket.on("connect_error", (error) => {
            if (get().isSocketConnected) {
              get().disconnect();
            }
            throw error;
          });

          set({ socket });
        } catch (error) {
          console.error("Error connecting to socket:", error);
          throw error;
        }
      },
      disconnect: () => {
        const socket = get().socket;
        if (!socket) return;

        try {
          socket.disconnect();
          set({ socket: null, isSocketConnected: false });
        } catch (error) {
          console.error("Error disconnecting from socket:", error);
          throw error;
        }
      },
      joinRoom: (eventCode: string) => {
        const socket = get().socket;
        if (!socket) return;

        try {
          socket.emit(
            "join_room",
            eventCode,
            (response: { success: boolean; message: string }) => {
              if (!response.success) {
                throw new Error(`Live checkin failed: ${response.message}`);
              }
            }
          );
        } catch (error) {
          console.error("Error joining room:", error);
          throw error;
        }
      },
      leaveRoom: (eventCode: string) => {
        const socket = get().socket;
        if (!socket) return;

        try {
          socket.emit("leave_room", eventCode);
        } catch (error) {
          console.error("Error leaving room:", error);
          throw error;
        }
      },
    }),
    {
      name: "Socket Store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
