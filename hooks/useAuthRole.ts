"use client";

import { useMemo } from "react";
import { ROLE_REDIRECTS } from "@/types/roles";
import { useAuth } from "./useAuth";

export const useAuthRole = () => {
  const { user, status } = useAuth();
  const role = user?.role ?? null;
  const redirectPath = role ? ROLE_REDIRECTS[role] : "/auth/login";
  return useMemo(
    () => ({
      user,
      role,
      isSignedIn: Boolean(role),
      isLoaded: status !== "loading",
      redirectPath
    }),
    [redirectPath, role, status, user]
  );
};

