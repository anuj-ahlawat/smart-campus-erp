"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { ROLE_LABELS, ROLE_NAV_LINKS, type UserRole } from "@/types/roles";
import { cn } from "@/src/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

type Props = {
  role: UserRole;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export const RoleLayout = ({ role, title, subtitle, actions, children }: Props) => {
  const pathname = usePathname();
  const links = ROLE_NAV_LINKS[role];
  const label = ROLE_LABELS[role];
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 border-r border-border bg-white/90 p-6 lg:block">
        <div className="font-semibold text-lg">{label} Portal</div>
        <nav className="mt-6 space-y-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 font-medium transition",
                pathname.startsWith(link.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 lg:p-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase text-muted-foreground tracking-wide">{label}</p>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            {actions}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">{user?.name}</span>
              <Button size="sm" variant="outline" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>
        </header>
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  );
};

