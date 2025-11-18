import { cn } from "@/src/lib/utils";
import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export const Card = ({ className, children, title, subtitle, actions, ...props }: CardProps) => (
  <div className={cn("rounded-xl border border-border bg-card p-5 shadow-sm", className)} {...props}>
    {(title || actions) && (
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-base font-semibold">{title}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions}
      </div>
    )}
    {children}
  </div>
);

