"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_REDIRECTS, type UserRole } from "@/types/roles";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const redirect = searchParams.get("redirect");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      const next = redirect ?? ROLE_REDIRECTS[user.role as UserRole] ?? "/not-authorized";
      router.replace(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout
      title="Sign in to Smart Campus"
      subtitle="Custom JWT + refresh token authentication."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="Email"
          type="email"
          placeholder="admin@college.edu"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <FormField
          label="Password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="mt-6 flex flex-col gap-2 text-center text-sm text-muted-foreground">
        <Link href="/auth/forgot-password" className="text-primary underline">
          Forgot password?
        </Link>
        <Link href="/auth/register" className="text-primary underline">
          Have an invite code? Join your college portal.
        </Link>
        <Link href="/auth/college-register" className="text-primary underline">
          First college admin? Register your campus →
        </Link>
      </div>
    </PublicLayout>
  );
}


