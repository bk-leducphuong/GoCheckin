import { useSocketStore } from "@/store/socketStore";
import { useShallow } from "zustand/shallow";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Error from "../ui/Error";

interface PocSocketProps {
  children: React.ReactNode;
}
export default function PocSocket({ children }: PocSocketProps) {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const eventCode = searchParams.get("eventCode") as string;
  const pointCode = searchParams.get("pointCode") as string;

  const { connect, disconnect, sendHeartbeatSignal } = useSocketStore(
    useShallow((state) => ({
      connect: state.connect,
      disconnect: state.disconnect,
      sendHeartbeatSignal: state.sendHeartbeatSignal,
    }))
  );

  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout | null = null;
    const connectSocket = async () => {
      try {
        await connect();

        sendHeartbeatSignal(eventCode, pointCode);

        // Set up interval for heartbeat
        heartbeatInterval = setInterval(() => {
          sendHeartbeatSignal(eventCode, pointCode);
        }, 30000); // 30 seconds
      } catch (error) {
        setError("Failed to connect to socket");
      }
    };

    connectSocket();

    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      disconnect();
    };
  }, [connect, disconnect, sendHeartbeatSignal, eventCode, pointCode]);

  if (error) {
    return <Error message={error} redirectTo="/login" />;
  }

  return <>{children}</>;
}
