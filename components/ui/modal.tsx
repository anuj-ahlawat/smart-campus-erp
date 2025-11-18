"use client";

import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

type ModalProps = {
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const Modal = ({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange
}: ModalProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <Dialog.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl focus:outline-none"
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
            {description && (
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                {description}
              </Dialog.Description>
            )}
          </div>
          <Dialog.Close className="rounded-full border border-transparent p-1 text-muted-foreground hover:border-border">
            <X size={18} />
          </Dialog.Close>
        </div>
        <div className="mt-4">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

