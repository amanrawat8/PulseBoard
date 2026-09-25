import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import type { Socket } from "socket.io-client";

import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useAuth } from "./auth-context";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isBootstrapping } = useAuth();
  const socketRef = useRef<Socket>(getSocket());

  useEffect(() => {
    if (isBootstrapping) return;

    if (user) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [user, isBootstrapping]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): Socket {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
