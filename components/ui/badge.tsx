"use client";

import { cn } from "@/src/lib/utils";

type BadgeProps = {
  variant?: "default" | "success" | "danger" | "warning" | "outline";
  children: React.ReactNode;
  className?: string;
};

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  outline: "border border-border text-foreground"
};

export const Badge = ({ variant = "default", children, className }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
      variantClasses[variant],
      className
    )}
  >
    {children}
  </span>
);

