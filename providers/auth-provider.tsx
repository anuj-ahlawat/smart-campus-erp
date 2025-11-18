"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { API_BASE_URL } from "@/src/lib/routes";
import { handleApiErrors } from "@/src/lib/handleErrors";
import type { UserRole } from "@/types/roles";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  collegeId: string;
  department?: string;
  classSection?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  accessToken: string | null;
  login: (credentials: { email: string; password: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const persistRoleCookie = (role: UserRole | null) => {
  if (typeof document === "undefined") return;
  const maxAge = role ? 60 * 60 * 24 : 0;
  document.cookie = `campus_role=${role ?? ""}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `campus_authenticated=${role ? "1" : ""}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const loadMockUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("campus.mockUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

const clearMockUser = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("campus.mockUser");
};

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const assignSession = useCallback((nextUser: AuthUser | null, token: string | null) => {
    setUser(nextUser);
    setAccessToken(token);
    persistRoleCookie(nextUser?.role ?? null);
    setStatus(nextUser ? "authenticated" : "unauthenticated");
  }, []);

  const fetchProfile = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        return null;
      }
      const payload = await response.json();
      return payload.data as AuthUser;
    } catch (error) {
      handleApiErrors(error);
      return null;
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include"
      });
      if (!response.ok) {
        return null;
      }
      const payload = await response.json();
      const token = payload.data?.accessToken as string | undefined;
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
      const mock = loadMockUser();
      if (!cancelled) {
        if (mock) {
          assignSession(mock, null);
        } else {
          assignSession(null, null);
        }
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [assignSession, fetchProfile, refreshAccessToken]);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials)
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message ?? "Unable to login");
        }
        const token = payload.data?.accessToken as string;
        const authUser = payload.data?.user as AuthUser;
        assignSession(authUser, token);
        clearMockUser();
        return authUser;
      } catch (error) {
        handleApiErrors(error);
        throw error;
      }
    },
    [assignSession]
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
      });
    } catch (error) {
      console.warn("Logout failed", error);
    } finally {
      clearMockUser();
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
      refreshAccessToken
    }),
    [accessToken, login, logout, refreshAccessToken, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
};

