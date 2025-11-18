"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/providers/auth-provider";
import { SocketProvider } from "@/providers/socket-provider";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const queryClientRef = useRef<QueryClient>();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <AuthProvider>
        <SocketProvider>{children}</SocketProvider>
      </AuthProvider>
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
    </QueryClientProvider>
  );
}

