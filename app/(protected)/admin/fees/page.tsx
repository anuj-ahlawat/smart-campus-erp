"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

import type { UserRole } from "@/types/roles";

type StudentRecord = {
  _id: string;
  name: string;
  email?: string;
  classSection?: string;
};

type FeeRecord = {
  _id: string;
  studentId: string;
  term: string;
  component: string;
  label?: string;
  amount: number;
  dueDate?: string;
  status: "not_paid" | "partial" | "paid";
  paidAmount?: number;
  paidDate?: string;
};

const emptyForm = {
  studentId: "",
  term: "",
  component: "tuition",
  label: "",
  amount: "",
  dueDate: "",
  status: "not_paid" as "not_paid" | "partial" | "paid",
  paidAmount: "",
  paidDate: "",
  notes: ""
};

export default function AdminFeesPage() {
  const { role, isLoaded } = useRoleGuard("admin");
  const { request } = useApi();

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [filterTerm, setFilterTerm] = useState("");

  const loadStudents = async () => {
    const payload = await request<{ data: StudentRecord[] }>({
      method: "GET",
      url: "/users?role=student"
    });
    if (payload?.data) {
      setStudents(payload.data);
    }
  };

  const loadFees = async () => {
    try {
      setLoading(true);
      const query = filterTerm ? `?term=${encodeURIComponent(filterTerm)}` : "";
      const payload = await request<{ data: FeeRecord[] }>({
        method: "GET",
        url: `/fees${query}`
      });
      if (payload?.data) {
        setFees(payload.data);
      }
    } catch (error) {
      console.error("Failed to load fees", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !role) return;
    void (async () => {
      await loadStudents();
      await loadFees();
    })();
  }, [isLoaded, role]);

  useEffect(() => {
    if (!isLoaded || !role) return;
    void loadFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTerm]);

  const handleCreateFee = async () => {
    if (!form.studentId || !form.term || !form.component || !form.amount) return;
    setSaving(true);
    try {
      await request({
        method: "POST",
        url: "/fees",
        data: {
          studentId: form.studentId,
          term: form.term,
          component: form.component,
          label: form.label || undefined,
          amount: Number(form.amount),
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
          status: form.status,
          paidAmount: form.paidAmount ? Number(form.paidAmount) : undefined,
          paidDate: form.paidDate ? new Date(form.paidDate).toISOString() : undefined,
          notes: form.notes || undefined
        }
      });
      setForm({ ...emptyForm });
      await loadFees();
    } catch (error) {
      console.error("Failed to create fee", error);
    } finally {
      setSaving(false);
    }
  };

  const markAsPaid = async (fee: FeeRecord) => {
    try {
      await request({
        method: "PUT",
        url: `/fees/${fee._id}`,
        data: {
          status: "paid",
          paidAmount: fee.amount,
          paidDate: new Date().toISOString()
        }
      });
      await loadFees();
    } catch (error) {
      console.error("Failed to update fee", error);
    }
  };

  const studentOptions = useMemo(
    () =>
      students.map((s) => ({
        value: s._id,
        label: `${s.name}${s.classSection ? " — " + s.classSection : ""}`
      })),
    [students]
  );

  const columns = useMemo(
    () => [
      {
        key: "student",
        header: "Student",
        render: (row: FeeRecord) => {
          const student = students.find((s) => s._id === row.studentId);
          return student ? `${student.name}${student.classSection ? " — " + student.classSection : ""}` : row.studentId;
        }
      },
      { key: "term", header: "Term" },
      {
        key: "component",
        header: "Component",
        render: (row: FeeRecord) => row.label || row.component
      },
      {
        key: "amount",
        header: "Amount",
        render: (row: FeeRecord) => `₹${row.amount.toFixed(2)}`
      },
      {
        key: "status",
        header: "Status",
        render: (row: FeeRecord) =>
          row.status === "paid" ? "Paid" : row.status === "partial" ? "Partially paid" : "Not paid"
      },
      {
        key: "dueDate",
        header: "Due date",
        render: (row: FeeRecord) => (row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "-")
      },
      {
        key: "actions",
        header: "Actions",
        render: (row: FeeRecord) => (
          <div className="flex gap-2 text-xs">
            {row.status !== "paid" && (
              <Button size="sm" variant="outline" onClick={() => void markAsPaid(row)}>
                Mark as paid
              </Button>
            )}
          </div>
        )
      }
    ],
    [students]
  );

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="admin"
      title="Fees Management"
      subtitle="Manage fee components per student and track paid / not-paid status."
    >
      <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
        <Card>
          <div className="space-y-3 p-4 text-sm">
            <div className="font-medium text-xs mb-1">Create fee component</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Student</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.studentId}
                  onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
                >
                  <option value="">Select student</option>
                  {studentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Term / Academic year</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.term}
                  onChange={(e) => setForm((prev) => ({ ...prev, term: e.target.value }))}
                  placeholder="e.g. 2025-26 Sem 1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Component</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.component}
                  onChange={(e) => setForm((prev) => ({ ...prev, component: e.target.value }))}
                >
                  <option value="tuition">Tuition</option>
                  <option value="hostel">Hostel</option>
                  <option value="transport">Transport</option>
                  <option value="exam">Exam</option>
                  <option value="library">Library</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Custom label (optional)</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.label}
                  onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g. Bus fee, Hostel mess"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Amount</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Due date (optional)</label>
                <input
                  type="date"
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.dueDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Initial status</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as typeof form.status }))}
                >
                  <option value="not_paid">Not paid</option>
                  <option value="partial">Partially paid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Paid amount (optional)</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.paidAmount}
                  onChange={(e) => setForm((prev) => ({ ...prev, paidAmount: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Paid date (optional)</label>
                <input
                  type="date"
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.paidDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, paidDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Notes (optional)</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setForm({ ...emptyForm })}
                disabled={saving}
              >
                Clear
              </Button>
              <Button size="sm" onClick={handleCreateFee} disabled={saving}>
                {saving ? "Saving..." : "Save fee"}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium text-xs">Fee items</div>
              <input
                className="w-40 rounded-md border border-border bg-background px-2 py-1 text-xs"
                placeholder="Filter term..."
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
              />
            </div>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading fees...</div>
            ) : (
              <DataTable data={fees} columns={columns as never} />
            )}
          </div>
        </Card>
      </div>
    </RoleLayout>
  );
}
