"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/src/lib/routes";
import { handleApiErrors } from "@/src/lib/handleErrors";

type InviteDetails = {
  role: string;
  department?: string;
  classSection?: string;
  collegeId: string;
};

export const useInvite = (code?: string | null) => {
  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [status, setStatus] = useState<"idle" | "validating" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const validate = async () => {
      if (!code) {
        setDetails(null);
        setStatus("idle");
        setError(null);
        return;
      }
      setStatus("validating");
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/invite/validate?code=${code}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message ?? "Invite invalid");
        }
        if (!cancelled) {
          setDetails(payload.data as InviteDetails);
          setStatus("success");
        }
      } catch (err) {
        handleApiErrors(err);
        if (!cancelled) {
          setDetails(null);
          setStatus("error");
          setError((err as Error).message);
        }
      }
    };
    validate();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return { details, status, error };
};


