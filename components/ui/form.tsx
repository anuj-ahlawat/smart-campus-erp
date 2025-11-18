"use client";

import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "./button";

type FormProps = {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
};

export const Form = ({ onSubmit, children, submitLabel = "Save", className }: FormProps) => (
  <form
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit(event);
    }}
    className={cn("space-y-4", className)}
  >
    {children}
    <div className="flex justify-end">
      <Button type="submit">{submitLabel}</Button>
    </div>
  </form>
);

