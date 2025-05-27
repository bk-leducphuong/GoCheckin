import { useSocketStore } from "@/store/poc/socketStore";
import { useShallow } from "zustand/shallow";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Error from "@/components/ui/Error";
import { ApiError } from "@/lib/error";

interface PocSocketProps {
  children: React.ReactNode;
}
export default function PocSocket({ children }: PocSocketProps) {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

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

        if (!searchParams) {
          return (
            <Error
              message="Event code and point code are required"
              redirectTo="/login"
            />
          );
        }
        const eventCode = searchParams.get("eventCode");
        const pointCode = searchParams.get("pointCode");
        if (!eventCode || !pointCode) {
          return (
            <Error
              message="Event code and point code are required"
              redirectTo="/login"
            />
          );
        }

        sendHeartbeatSignal(eventCode, pointCode);

        // Set up interval for heartbeat
        heartbeatInterval = setInterval(() => {
          sendHeartbeatSignal(eventCode, pointCode);
        }, 30000); // 30 seconds
      } catch (error) {
        setError(
          error instanceof ApiError
            ? error.message
            : "Failed to connect to socket"
        );
      }
    };

    connectSocket();

    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      disconnect();
    };
  }, [connect, disconnect, sendHeartbeatSignal, searchParams]);

  if (error) {
    return <Error message={error} redirectTo="/login" />;
  }

  return <>{children}</>;
}
