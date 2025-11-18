"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import { Badge } from "@/components/ui/badge";

const roles = ["student", "teacher", "parent", "warden", "staff", "cafeteria", "security"];

export default function AdminOnboardingPage() {
  const { role, isLoaded } = useRoleGuard("admin");
  const { request } = useApi();
  const [inviteForm, setInviteForm] = useState({
    role: "student",
    department: "",
    classSection: "",
    hostelStatus: false,
    roomNumber: "",
    validUntil: ""
  });
  const [bulkCsv, setBulkCsv] = useState("");
  const [invites, setInvites] = useState<string[]>([]);

  if (!isLoaded || !role) return null;

  const handleCreateInvite = async () => {
    const payload = await request<{ data: Array<{ code: string }> }>({
      method: "POST",
      url: "/auth/invite/create",
      data: inviteForm
    });
    if (payload?.data) {
      setInvites(payload.data.map((item) => item.code));
    }
  };

  const handleCsvInvite = async () => {
    const payload = await request<{ data: Array<{ code: string }> }>({
      method: "POST",
      url: "/auth/invite/create",
      data: { bulkCsv }
    });
    if (payload?.data) {
      setInvites(payload.data.map((item) => item.code));
    }
  };

  return (
    <RoleLayout
      role="admin"
      title="Onboarding"
      subtitle="Generate invite codes or upload CSV to pre-provision Students, Teachers, Wardens, Staff, Cafeteria, Security, and Parents."
    >
      <Card title="Generate single invite" subtitle="POST /api/auth/invite/create">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Role</span>
            <select
              className="w-full rounded-lg border border-border bg-transparent p-2 text-sm"
              value={inviteForm.role}
              onChange={(event) =>
                setInviteForm((prev) => ({ ...prev, role: event.target.value }))
              }
            >
              {roles.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <FormField
            label="Department"
            placeholder="CSE"
            value={inviteForm.department}
            onChange={(event) => setInviteForm((prev) => ({ ...prev, department: event.target.value }))}
          />
          <FormField
            label="Class / Section"
            placeholder="CSE-A"
            value={inviteForm.classSection}
            onChange={(event) =>
              setInviteForm((prev) => ({ ...prev, classSection: event.target.value }))
            }
          />
          <FormField
            label="Room number"
            placeholder="H-203"
            value={inviteForm.roomNumber}
            onChange={(event) =>
              setInviteForm((prev) => ({ ...prev, roomNumber: event.target.value }))
            }
          />
          <FormField
            label="Valid until"
            type="date"
            value={inviteForm.validUntil}
            onChange={(event) =>
              setInviteForm((prev) => ({ ...prev, validUntil: event.target.value }))
            }
          />
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={inviteForm.hostelStatus}
              onChange={(event) =>
                setInviteForm((prev) => ({ ...prev, hostelStatus: event.target.checked }))
              }
            />
            Hostel resident?
          </label>
        </div>
        <Button className="mt-4" onClick={handleCreateInvite}>
          Generate invite code
        </Button>
      </Card>

      <Card
        title="Bulk upload CSV"
        subtitle="Columns: email,role,department,classSection,hostelStatus,roomNumber. Paste CSV rows and POST /api/auth/invite/create with bulkCsv."
      >
        <textarea
          className="min-h-[150px] w-full rounded-xl border border-border bg-transparent p-3 text-sm"
          placeholder="student1@college.edu,student,CSE,CSE-A,true,H-203"
          value={bulkCsv}
          onChange={(event) => setBulkCsv(event.target.value)}
        />
        <Button className="mt-4" variant="outline" onClick={handleCsvInvite}>
          Upload CSV rows
        </Button>
      </Card>

      {!!invites.length && (
        <Card title="Latest invite codes">
          <div className="flex flex-wrap gap-2">
            {invites.map((code) => (
              <Badge key={code} variant="outline">
                {code}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </RoleLayout>
  );
}


