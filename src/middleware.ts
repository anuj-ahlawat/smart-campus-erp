import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PATH_ROLE_MATRIX } from "@/src/lib/routes";
import type { UserRole } from "@/types/roles";

const ROLE_COOKIE = "campus_role";
const AUTH_COOKIE = "campus_authenticated";

const isProtectedPath = (pathname: string) =>
  PATH_ROLE_MATRIX.some(({ prefix }) => pathname.startsWith(prefix));

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const role = req.cookies.get(ROLE_COOKIE)?.value as UserRole | undefined;
  const isAuthenticated = req.cookies.get(AUTH_COOKIE)?.value === "1";

  if (!role || !isAuthenticated) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const matched = PATH_ROLE_MATRIX.find(({ prefix }) => pathname.startsWith(prefix));
  if (matched && !matched.roles.includes(role)) {
    return NextResponse.redirect(new URL("/not-authorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/student/:path*",
    "/teacher/:path*",
    "/parent/:path*",
    "/warden/:path*",
    "/staff/:path*",
    "/cafeteria/:path*",
    "/security/:path*"
  ]
};
