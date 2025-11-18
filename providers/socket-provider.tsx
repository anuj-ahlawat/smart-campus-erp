"use client";

import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/src/lib/routes";

const SocketContext = createContext<Socket | null>(null);

type Props = {
  children: ReactNode;
};

export const SocketProvider = ({ children }: Props) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const instance = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true
    });
    setSocket(instance);
    return () => {
      instance.disconnect();
    };
  }, []);

  const value = useMemo(() => socket, [socket]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => useContext(SocketContext);

