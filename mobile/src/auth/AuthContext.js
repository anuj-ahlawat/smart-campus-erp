import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5050/api";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "authenticated" | "unauthenticated"

  const assignSession = useCallback((nextUser, token) => {
    setUser(nextUser);
    setAccessToken(token);
    setStatus(nextUser ? "authenticated" : "unauthenticated");
  }, []);

  const fetchProfile = useCallback(async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        return null;
      }
      const payload = await response.json();
      return payload.data;
    } catch {
      return null;
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
      });
      if (!response.ok) {
        return null;
      }
      const payload = await response.json();
      const token = payload.data?.accessToken;
      if (!token) return null;
      setAccessToken(token);
      return token;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      const token = await refreshAccessToken();
      if (token) {
        const profile = await fetchProfile(token);
        if (!cancelled) {
          assignSession(profile ?? null, profile ? token : null);
        }
        return;
      }
      if (!cancelled) {
        assignSession(null, null);
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [assignSession, fetchProfile, refreshAccessToken]);

  const login = useCallback(
    async (credentials) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to login");
      }
      const token = payload.data?.accessToken;
      const authUser = payload.data?.user;
      assignSession(authUser, token);
      return authUser;
    },
    [assignSession]
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
    } catch {
      // ignore
    } finally {
      assignSession(null, null);
    }
  }, [accessToken, assignSession]);

  const value = useMemo(
    () => ({
      user,
      status,
      accessToken,
      login,
      logout,
      refreshAccessToken,
    }),
    [accessToken, login, logout, refreshAccessToken, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}


