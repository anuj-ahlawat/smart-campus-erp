"use client";

import { useEffect } from "react";
import { useSocketContext } from "@/providers/socket-provider";
import { Socket } from "socket.io-client";

export const useSocket = <T extends (...args: never[]) => void>(
  event: string,
  handler: T
) => {
  const socket = useSocketContext();

  useEffect(() => {
    if (!socket) return;
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event, handler, socket]);

  return socket as Socket | null;
};

