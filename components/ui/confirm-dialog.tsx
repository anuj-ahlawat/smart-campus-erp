"use client";

import { ReactNode, useState } from "react";
import { Button } from "./button";
import { Modal } from "./modal";

type ConfirmDialogProps = {
  title: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
  triggerLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  children?: ReactNode;
};

export const ConfirmDialog = ({
  title,
  description,
  onConfirm,
  triggerLabel = "Open",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  children
}: ConfirmDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    setOpen(false);
  };

  return (
    <Modal
      title={title}
      description={description}
      trigger={
        <Button variant={variant === "destructive" ? "danger" : "outline"}>
          {triggerLabel}
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
    >
      {children && <div className="mb-4 text-sm text-muted-foreground">{children}</div>}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => setOpen(false)}>
          {cancelLabel}
        </Button>
        <Button variant={variant === "destructive" ? "danger" : "default"} onClick={handleConfirm} disabled={loading}>
          {loading ? "Processing..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

