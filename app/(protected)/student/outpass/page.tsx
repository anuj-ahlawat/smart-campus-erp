"use client";

import { useEffect, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";

type OutpassRow = {
  id: string;
  type: "day" | "leave" | string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
};

export default function StudentOutpassListPage() {
  const { role, isLoaded } = useRoleGuard("student");
  const { user } = useAuth();
  const { request } = useApi();

  const [rows, setRows] = useState<OutpassRow[]>([]);
  const [type, setType] = useState<"day" | "leave">("day");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const response = await request<{ status: number; data: OutpassRow[] }>({
        method: "GET",
        url: `/outpass/student/${user.id}`
      });
      if (response?.data) {
        setRows(
          response.data.map((item) => ({
            id: (item as any)._id ?? (item as any).id ?? "",
            type: item.type,
            fromDate: item.fromDate,
            toDate: item.toDate,
            reason: item.reason,
            status: item.status
          }))
        );
      }
    };
    void load();
  }, [request, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fromDate || !toDate || !reason || !user) return;
    try {
      setIsSubmitting(true);
      const payload = {
        type,
        fromDate: new Date(fromDate).toISOString(),
        toDate: new Date(toDate).toISOString(),
        reason
      };
      await request({
        method: "POST",
        url: "/outpass/apply",
        data: payload
      });

      // Reload history
      const response = await request<{ status: number; data: OutpassRow[] }>({
        method: "GET",
        url: `/outpass/student/${user.id}`
      });
      if (response?.data) {
        setRows(
          response.data.map((item) => ({
            id: (item as any)._id ?? (item as any).id ?? "",
            type: item.type,
            fromDate: item.fromDate,
            toDate: item.toDate,
            reason: item.reason,
            status: item.status
          }))
        );
      }

      // Reset form
      setReason("");
      setFromDate("");
      setToDate("");
      setType("day");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || !role || !user) return null;

  return (
    <RoleLayout
      role="student"
      title="Outpass"
      subtitle="Apply leave and gate pass and track their status."
    >
      <Card
        title="Apply leave and gate pass"
        actions={
          <Button size="sm" variant="default">
            Apply leave and gate pass
          </Button>
        }
      >
        <div className="border border-border rounded-lg overflow-hidden text-xs md:text-sm">
          <div className="grid grid-cols-3 bg-muted px-4 py-2 font-medium text-muted-foreground">
            <div>DATE</div>
            <div>REASON</div>
            <div className="text-right">STATUS</div>
          </div>
          <div className="divide-y">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-3 items-center px-4 py-2 gap-2"
              >
                <div>
                  <div className="font-medium text-xs md:text-sm">
                    {row.type === "leave" ? "Leave Out Pass" : "Day Out Pass"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(row.fromDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                    {" to "}
                    {new Date(row.toDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </div>
                </div>
                <div className="text-[11px] md:text-xs text-muted-foreground line-clamp-1">{row.reason}</div>
                <div className="flex justify-end">
                  <span
                    className={
                      row.status === "approved"
                        ? "rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200"
                        : "rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 border border-slate-200"
                    }
                  >
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="Apply gate pass" subtitle="Fill in the details below to request a gate/out pass.">
        <form className="space-y-4 text-sm" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Gate pass type *</label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                value={type}
                onChange={(event) => setType(event.target.value as "day" | "leave")}
              >
                <option value="day">Day out pass</option>
                <option value="leave">Leave out pass</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">From date &amp; time *</label>
              <input
                type="datetime-local"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">To date &amp; time *</label>
              <input
                type="datetime-local"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Reason for gate pass *</label>
            <textarea
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs min-h-[80px]"
              placeholder="Reason for absence"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Upload documents</label>
            <div className="flex flex-col gap-2 rounded-md border border-dashed border-border bg-muted/40 p-3 md:flex-row md:items-center md:justify-between">
              <div className="text-xs text-muted-foreground">
                Drag 'n' drop some files here
              </div>
              <div className="text-xs">
                <Button type="button" size="sm" variant="outline">
                  Choose a file
                </Button>
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Supported files: .doc, .png, .jpg, .jpeg, .pdf, .xlsx, .docx
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4 text-xs md:flex-row md:justify-end">
            <div className="flex gap-2 md:ml-auto">
              <Button type="submit" size="sm" className="px-6" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="px-6"
                onClick={() => {
                  setReason("");
                  setFromDate("");
                  setToDate("");
                  setType("day");
                }}
              >
                Reset
              </Button>
              <Button type="button" size="sm" variant="outline" className="px-6">
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </RoleLayout>
  );
}


