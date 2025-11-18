"use client";

import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type FieldElementProps = InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

type FormFieldProps = {
  label: string;
  hint?: string;
  error?: string | null;
  addon?: ReactNode;
  as?: "input" | "textarea";
} & FieldElementProps;

export const FormField = ({
  label,
  hint,
  error,
  addon,
  className,
  as = "input",
  ...props
}: FormFieldProps) => {
  const shared = cn(
    "mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    className
  );

  const field =
    as === "textarea" ? (
      <textarea {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)} className={shared} />
    ) : (
      <input {...(props as InputHTMLAttributes<HTMLInputElement>)} className={shared} />
    );

  return (
    <label className="block text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {hint && <span className="ml-1 text-xs text-muted-foreground">{hint}</span>}
      <div className="mt-1 flex items-center gap-2">
        <div className="flex-1">{field}</div>
        {addon}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </label>
  );
};


