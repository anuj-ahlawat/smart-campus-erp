"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

type StudentRecord = {
  _id: string;
  name: string;
  classSection?: string;
};

type ResultRow = {
  _id: string;
  subjectId: string;
  marks?: number;
  grade?: string;
  published: boolean;
  createdAt: string;
};

export default function ParentResultsPage() {
  const { role, isLoaded } = useRoleGuard("parent");
  const { request } = useApi();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded || !role) return;
    const loadStudents = async () => {
      const payload = await request<{ data: StudentRecord[] }>({
        method: "GET",
        url: "/users?role=student"
      });
      if (payload?.data) {
        setStudents(payload.data);
      }
    };
    void loadStudents();
  }, [isLoaded, role, request]);

  useEffect(() => {
    if (!isLoaded || !role || !selectedStudentId) return;
    const loadResults = async () => {
      try {
        setLoading(true);
        const payload = await request<{ data: ResultRow[] }>({
          method: "GET",
          url: `/results/student/${selectedStudentId}`
        });
        if (payload?.data) {
          setRows(payload.data.filter((item) => item.published));
        }
      } catch (error) {
        console.error("Failed to load child results", error);
      } finally {
        setLoading(false);
      }
    };
    void loadResults();
  }, [isLoaded, role, selectedStudentId, request]);

  const studentOptions = useMemo(
    () =>
      students.map((s) => ({
        value: s._id,
        label: `${s.name}${s.classSection ? " — " + s.classSection : ""}`
      })),
    [students]
  );

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="parent"
      title="Child results"
      subtitle="Select a child to view their published results."
    >
      <div className="space-y-3 mb-4 text-sm">
        <Card>
          <div className="p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-xs font-medium">Select child</div>
            <select
              className="w-full md:w-64 rounded-md border border-border bg-background px-2 py-1 text-xs"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">Choose student</option>
              {studentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </Card>
      </div>

      <Card>
        {loading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Loading results...</div>
        ) : !selectedStudentId ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Select a child to see results.</div>
        ) : rows.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">No published results for this child yet.</div>
        ) : (
          <DataTable
            data={rows}
            columns={[
              { key: "subjectId", header: "Subject" },
              { key: "marks", header: "Marks" },
              { key: "grade", header: "Grade" },
              {
                key: "createdAt",
                header: "Published at",
                render: (row: ResultRow) => new Date(row.createdAt).toLocaleString()
              }
            ]}
          />
        )}
      </Card>
    </RoleLayout>
  );
}


