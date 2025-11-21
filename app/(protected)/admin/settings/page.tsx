"use client";

import { useEffect, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

export default function AdminSettingsPage() {
  const { role, isLoaded } = useRoleGuard("admin");
  const { request } = useApi();
  const [form, setForm] = useState({
    academicYear: "2025-2026",
    slotsPerDay: 7,
    curfewTime: "21:00",
    totalRooms: 400
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const payload = await request<{
        data?: {
          academicYear: string;
          timetableConfig?: { slotsPerDay: number };
          hostelConfig?: { curfewTime: string; totalRooms: number };
        };
      }>({
        method: "GET",
        url: "/college/settings"
      });

      const settings = payload?.data;
      if (!settings) return;

      setForm((prev) => ({
        ...prev,
        academicYear: settings.academicYear ?? prev.academicYear,
        slotsPerDay: settings.timetableConfig?.slotsPerDay ?? prev.slotsPerDay,
        curfewTime: settings.hostelConfig?.curfewTime ?? prev.curfewTime,
        totalRooms: settings.hostelConfig?.totalRooms ?? prev.totalRooms
      }));
    };
    load();
  }, [request]);

  if (!isLoaded || !role) return null;

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <RoleLayout
      role="admin"
      title="College settings"
      subtitle="Persisted via PUT /api/college/settings. Controls onboarding defaults & timetable generation."
    >
      <Card title="Academic" subtitle="Used when generating invites + timetables.">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Academic year"
            value={form.academicYear}
            onChange={(event) => update("academicYear", event.target.value)}
            required
          />
          <FormField
            label="Slots per day"
            type="number"
            value={form.slotsPerDay}
            onChange={(event) => update("slotsPerDay", Number(event.target.value))}
            required
          />
        </div>
      </Card>
      <Card title="Hostel" subtitle="Controls Outpass + hostel roster defaults.">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Curfew time"
            type="time"
            value={form.curfewTime}
            onChange={(event) => update("curfewTime", event.target.value)}
            required
          />
          <FormField
            label="Total rooms"
            type="number"
            value={form.totalRooms}
            onChange={(event) => update("totalRooms", Number(event.target.value))}
            required
          />
        </div>
      </Card>
      <Button
        className="self-start"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await request({
            method: "PUT",
            url: "/college/settings",
            data: form
          });
          setLoading(false);
        }}
      >
        {loading ? "Saving..." : "Save settings"}
      </Button>
    </RoleLayout>
  );
}


