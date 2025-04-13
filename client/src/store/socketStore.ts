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
      connect:  () => {
        try {
          const socket = io(
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
            {
              transports: ["websocket", "polling"],
              // Avoid reconnection flood
              reconnectionAttempts: 5,
              reconnectionDelay: 1000,
              reconnectionDelayMax: 5000,
            }
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
            console.error("Socket connection error:", error);
            get().disconnect();
            set({ isSocketConnected: false });
          });
          set({ socket });
        } catch (error) {
          console.error("Error connecting to socket:", error);
          throw error;
        }
      },
      disconnect:  () => {
        try {
          get().socket?.disconnect();
          set({ socket: null });
          set({ isSocketConnected: false });
        } catch (error) {
          console.error("Error disconnecting from socket:", error);
          throw error;
        }
      },
      joinRoom: (eventCode: string) => {
        try {
          const {socket} = get();
          if (!socket) return;
          socket.emit("join_room", eventCode, (response: { success: boolean, message: string }) => {
            if (!response.success) throw new Error("Live checkin is not available");
          });
        } catch (error) {
          console.error("Error joining room:", error);
          throw error;
        }
      },
      leaveRoom: (eventCode: string) => {
        try {
          const {socket} = get();
          if (!socket) return;
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
