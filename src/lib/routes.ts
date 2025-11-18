import { ROLE_ROUTE_PREFIX, type UserRole } from "@/types/roles";

export const PROTECTED_ROUTE_MATCHERS = [
  "/admin/:path*",
  "/student/:path*",
  "/teacher/:path*",
  "/parent/:path*",
  "/warden/:path*",
  "/staff/:path*",
  "/cafeteria/:path*",
  "/security/:path*"
];

type PathRole = {
  prefix: string;
  roles: UserRole[];
};

export const PATH_ROLE_MATRIX: PathRole[] = Object.entries(
  ROLE_ROUTE_PREFIX
).flatMap(([role, prefixes]) =>
  prefixes.map((prefix) => ({
    prefix,
    roles: [role as UserRole]
  }))
);

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050/api";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5050";

