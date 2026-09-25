import { io, type Socket } from "socket.io-client";

import { API_URL } from "./api-client";
import { getAccessToken } from "./token-store";

let socket: Socket | null = null;

/**
 * Lazily creates a single shared socket connection. The `auth` callback
 * form re-reads the access token from the in-memory store on every
 * (re)connection attempt, so a token rotated via silent refresh is picked
 * up automatically without needing to manually recreate the socket.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      autoConnect: false,
      auth: (cb) => cb({ token: getAccessToken() }),
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  socket?.disconnect();
}
