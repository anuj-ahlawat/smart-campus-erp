"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { exportCSV } from "@/src/lib/export";

const attendanceRows = [
  { classId: "CSE-A", date: "2025-08-01", subject: "AI", percentage: 92 },
  { classId: "CSE-B", date: "2025-08-01", subject: "DSA", percentage: 88 }
];

export default function AdminAttendancePage() {
  const { role, isLoaded } = useRoleGuard("admin");
  const [filters, setFilters] = useState({ department: "CSE", date: "" });
  if (!isLoaded || !role) return null;

  return (
    <RoleLayout role="admin" title="Attendance Intelligence">
      <Card title="Filters">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Department</label>
            <select
              className="mt-1 w-full rounded-lg border border-border bg-transparent p-2 text-sm"
              value={filters.department}
              onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}
            >
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-border bg-transparent p-2 text-sm"
              value={filters.date}
              onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <Button className="w-full">Run Report</Button>
          </div>
        </div>
      </Card>
      <Card
        title="Classes"
        actions={
          <Button variant="outline" onClick={() => exportCSV("attendance-report", attendanceRows)}>
            Export CSV
          </Button>
        }
      >
        <DataTable
          data={attendanceRows}
          columns={[
            { key: "classId", header: "Class" },
            { key: "subject", header: "Subject" },
            { key: "date", header: "Date" },
            { key: "percentage", header: "Attendance" }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}

