import { useEffect, useRef } from "react";

import { useSocket } from "@/context/socket-context";

/**
 * Subscribes to a socket event for the lifetime of the component, always
 * invoking the latest `handler` without re-subscribing on every render
 * (the handler is called through a ref rather than being an effect dep).
 */
export function useSocketEvent<T = unknown>(
  event: string,
  handler: (payload: T) => void
): void {
  const socket = useSocket();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    function listener(payload: T) {
      handlerRef.current(payload);
    }
    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  }, [socket, event]);
}
