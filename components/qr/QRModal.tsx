"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type Props = {
  value: string;
  label?: string;
};

export const QRModal = ({ value, label = "View QR" }: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <Modal
      title="Scan this QR"
      description="Show this code at gates or kiosks."
      trigger={
        <Button variant="outline" size="sm">
          {label}
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-xl border border-border bg-white p-6">
          <QRCodeCanvas value={value} size={220} />
        </div>
        <p className="text-sm text-muted-foreground break-all">{value}</p>
      </div>
    </Modal>
  );
};

