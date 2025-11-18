import { ROLE_REDIRECTS, type UserRole } from "@/types/roles";

export const getRedirectForRole = (role?: UserRole | null) =>
  role ? ROLE_REDIRECTS[role] : "/sign-in";

