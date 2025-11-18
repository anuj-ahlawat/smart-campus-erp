"use client";

import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type PublicLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export const PublicLayout = ({ title, subtitle, children, className }: PublicLayoutProps) => (
  <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
    <div
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card/80 p-8 shadow-xl backdrop-blur",
        className
      )}
    >
      <div className="mb-6 space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Smart Campus ERP</p>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  </div>
);


