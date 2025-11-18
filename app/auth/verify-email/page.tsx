"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/src/lib/routes";
import { handleApiErrors } from "@/src/lib/handleErrors";

type VerifyState = "idle" | "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyState>("idle");

  useEffect(() => {
    if (!token) return;
    setState("verifying");
    const verify = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`);
        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload.message ?? "Invalid or expired token");
        }
        setState("success");
      } catch (error) {
        handleApiErrors(error);
        setState("error");
      }
    };
    verify();
  }, [token]);

  const renderStatus = () => {
    switch (state) {
      case "verifying":
        return "Processing...";
      case "success":
        return "Email verification is not required. You can sign in directly.";
      case "error":
        return "Email verification is not required. You can sign in directly.";
      default:
        return "Email verification is not required. You can sign in directly.";
    }
  };

  return (
    <PublicLayout title="Email Verification" subtitle="Email verification is disabled. You can sign in directly after registration.">
      <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">{renderStatus()}</div>
      <Button className="mt-6 w-full" onClick={() => router.replace("/auth/login")}>
        Continue to login
      </Button>
    </PublicLayout>
  );
}


