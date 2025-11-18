"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { UserRole } from "@/types/roles";
import { useAuthRole } from "./useAuthRole";

export const useRoleGuard = (allowed: UserRole | UserRole[]) => {
  const expectedRoles = Array.isArray(allowed) ? allowed : [allowed];
  const router = useRouter();
  const { role, isLoaded } = useAuthRole();

  useEffect(() => {
    if (!isLoaded) return;
    if (!role) {
      router.replace("/auth/login");
      return;
    }
    if (!expectedRoles.includes(role)) {
      router.replace("/not-authorized");
    }
  }, [expectedRoles, isLoaded, role, router]);

  return { role, isLoaded };
};

