"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/src/lib/routes";
import { handleApiErrors } from "@/src/lib/handleErrors";
import { useInvite } from "@/hooks/useInvite";

export default function InviteRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("code") ?? "";
  const { details, status } = useInvite(inviteCode);
  const [form, setForm] = useState({
    code: inviteCode,
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, code: inviteCode }));
  }, [inviteCode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!details) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/invite/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to register with invite");
      }
      setSuccess(true);
      setTimeout(() => router.replace("/auth/login"), 2000);
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout
      title="Accept your Smart Campus invite"
      subtitle="Invite code required. Admins can upload CSVs or share deep links."
    >
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-muted/40 p-3 text-sm">
        <span>
          Status:{" "}
          <Badge variant={status === "success" ? "success" : status === "error" ? "danger" : "outline"}>
            {status === "success" ? "Invite valid" : status === "error" ? "Invalid / expired" : "Enter code"}
          </Badge>
        </span>
        {details && <span className="text-muted-foreground capitalize">{details.role}</span>}
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="Invite code"
          placeholder="INV-XXXXXX"
          value={form.code}
          onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
          required
        />
        <FormField
          label="Full name"
          placeholder="Your legal name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
        <FormField
          label="Email"
          type="email"
          placeholder="you@college.edu"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <FormField
          label="Phone"
          type="tel"
          placeholder="+91 90000 00000"
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          required
        />
        <FormField
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !details || status !== "success"}
        >
          {loading ? "Creating account..." : "Create account with invite"}
        </Button>
      </form>
      {success && (
        <div className="mt-4 rounded-2xl border border-success/40 bg-success/10 p-4 text-sm text-success">
          Account created. Redirecting you to the login screen…
        </div>
      )}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Need a code? Ask your college admin via <Link href="/admin/onboarding">/admin/onboarding</Link>.
      </div>
    </PublicLayout>
  );
}


