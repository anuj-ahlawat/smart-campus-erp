"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/src/lib/routes";
import { handleApiErrors } from "@/src/lib/handleErrors";

type FormState = {
  collegeName: string;
  adminName: string;
  adminEmail: string;
  password: string;
  phone: string;
  instituteCode?: string;
  academicYear: string;
};

const initialState: FormState = {
  collegeName: "",
  adminName: "",
  adminEmail: "",
  password: "",
  phone: "",
  instituteCode: "",
  academicYear: "2025-2026"
};

export default function CollegeRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/college-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to register college");
      }
      setComplete(true);
      setForm(initialState);
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout
      title="Register your college"
      subtitle="First admin creates the college record and can immediately access the admin dashboard."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="College name"
          placeholder="Techno University"
          value={form.collegeName}
          onChange={(event) => update("collegeName", event.target.value)}
          required
        />
        <FormField
          label="Academic year"
          placeholder="2025-2026"
          value={form.academicYear}
          onChange={(event) => update("academicYear", event.target.value)}
          required
        />
        <FormField
          label="Admin full name"
          placeholder="Dr. Ananya Rao"
          value={form.adminName}
          onChange={(event) => update("adminName", event.target.value)}
          required
        />
        <FormField
          label="Admin email"
          type="email"
          placeholder="admin@college.edu"
          value={form.adminEmail}
          onChange={(event) => update("adminEmail", event.target.value)}
          required
        />
        <FormField
          label="Phone"
          type="tel"
          placeholder="+91 90000 00000"
          value={form.phone}
          onChange={(event) => update("phone", event.target.value)}
          required
        />
        <FormField
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
          required
        />
        <FormField
          label="Institute code"
          hint="Optional"
          placeholder="COL-501"
          value={form.instituteCode}
          onChange={(event) => update("instituteCode", event.target.value)}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Register college"}
        </Button>
      </form>
      {complete && (
        <div className="mt-4 rounded-2xl border border-success/40 bg-success/10 p-4 text-sm text-success">
          College and admin account created successfully! You can now sign in and access the admin dashboard.
        </div>
      )}
    </PublicLayout>
  );
}


