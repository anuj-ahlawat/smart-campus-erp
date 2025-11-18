"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { handleApiErrors } from "@/src/lib/handleErrors";

type Props = {
  onScan: (value: string) => Promise<void> | void;
};

export const Scanner = ({ onScan }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    const reader = new BrowserMultiFormatReader();
    reader
      .listVideoInputDevices()
      .then((devices) => {
        if (!devices.length) throw new Error("No camera available");
        setIsScanning(true);
        return reader.decodeFromVideoDevice(
          devices[0].deviceId,
          videoRef.current!,
          async (result, error) => {
            if (result) {
              setIsScanning(false);
              reader.reset();
              await onScan(result.getText());
            }
            if (error) {
              // ignore frame errors
            }
          }
        );
      })
      .catch((error) => handleApiErrors(error))
      .finally(() => setIsScanning(false));
    return () => reader.reset();
  }, [onScan]);

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black/80">
        <video ref={videoRef} className="h-full w-full" />
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          // reload page to restart camera
          window.location.reload();
        }}
      >
        {isScanning ? "Scanning..." : "Restart Scanner"}
      </Button>
    </div>
  );
};

