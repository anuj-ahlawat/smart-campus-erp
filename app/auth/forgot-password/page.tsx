"use client";

import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/src/lib/routes";
import { handleApiErrors } from "@/src/lib/handleErrors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      setSubmitted(true);
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout
      title="Reset your password"
      subtitle="We will email you a short-lived reset link. Tokens expire after 30 minutes."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="Verified email"
          type="email"
          placeholder="student@college.edu"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending reset link..." : "Send reset link"}
        </Button>
      </form>
      {submitted && (
        <div className="mt-4 rounded-2xl border border-success/40 bg-success/10 p-4 text-sm text-success">
          If the email is registered you will receive a reset link shortly.
        </div>
      )}
    </PublicLayout>
  );
}


