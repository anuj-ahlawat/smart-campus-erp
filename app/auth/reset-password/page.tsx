"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/src/lib/routes";
import { handleApiErrors } from "@/src/lib/handleErrors";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") ?? "";
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to reset password");
      }
      setDone(true);
      setTimeout(() => router.replace("/auth/login"), 2000);
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout
      title="Create a new password"
      subtitle="Paste the secure token from your email or open the link directly."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="Reset token"
          placeholder="UUID token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
        />
        <FormField
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading || !token}>
          {loading ? "Updating..." : "Update password"}
        </Button>
      </form>
      {done && (
        <div className="mt-4 rounded-2xl border border-success/40 bg-success/10 p-4 text-sm text-success">
          Password updated. Redirecting to login…
        </div>
      )}
    </PublicLayout>
  );
}


