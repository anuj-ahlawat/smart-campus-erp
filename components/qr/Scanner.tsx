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
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      return;
    }

    const reader = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        if (!videoDevices.length) {
          throw new Error("No camera available");
        }

        const deviceId = videoDevices[0].deviceId;
        setIsScanning(true);

        await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          async (result, error) => {
            if (result) {
              setIsScanning(false);
              await onScan(result.getText());
            }
            if (error) {
              // ignore frame errors for individual frames
            }
          }
        );
      } catch (error) {
        handleApiErrors(error);
        setIsScanning(false);
      }
    };

    void startScanner();

    return () => {
      // In this version of @zxing/browser BrowserMultiFormatReader does not expose a reset method.
      // Decode stream will be stopped automatically when the component unmounts.
    };
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

