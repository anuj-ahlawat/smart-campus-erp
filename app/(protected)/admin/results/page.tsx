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

type ResultRecord = {
  _id: string;
  studentId: string;
  subjectId: string;
  marks?: number;
  grade?: string;
  published: boolean;
  createdAt: string;
};

const emptyForm = {
  studentId: "",
  subjectId: "",
  marks: "",
  grade: "",
  fileUrl: "",
  published: false
};

export default function AdminResultsPage() {
  const { role, isLoaded } = useRoleGuard("admin");
  const { request } = useApi();

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const loadStudents = async () => {
    const payload = await request<{ data: StudentRecord[] }>({
      method: "GET",
      url: "/users?role=student"
    });
    if (payload?.data) {
      setStudents(payload.data);
    }
  };

  const loadRecentResults = async () => {
    try {
      setLoading(true);
      // For now, fetch all students' results and flatten; in future, add a dedicated admin results listing.
      const allResults: ResultRecord[] = [];
      for (const student of students) {
        const payload = await request<{ data: ResultRecord[] }>({
          method: "GET",
          url: `/results/student/${student._id}`
        });
        if (payload?.data) {
          allResults.push(...payload.data);
        }
      }
      // Sort by createdAt desc and keep recent ones
      allResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setResults(allResults.slice(0, 50));
    } catch (error) {
      console.error("Failed to load results", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !role) return;
    void (async () => {
      await loadStudents();
    })();
  }, [isLoaded, role]);

  useEffect(() => {
    if (!isLoaded || !role) return;
    if (!students.length) return;
    void loadRecentResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students.length]);

  const handleSubmit = async () => {
    if (!form.studentId || !form.subjectId || !form.marks || !form.grade) return;
    setSaving(true);
    try {
      await request({
        method: "POST",
        url: "/results/upload",
        data: {
          studentId: form.studentId,
          subjectId: form.subjectId,
          marks: Number(form.marks),
          grade: form.grade,
          fileUrl: form.fileUrl || undefined,
          published: form.published
        }
      });
      setForm({ ...emptyForm });
      await loadRecentResults();
    } catch (error) {
      console.error("Failed to upload result", error);
    } finally {
      setSaving(false);
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
        render: (row: ResultRecord) => {
          const student = students.find((s) => s._id === row.studentId);
          return student ? `${student.name}${student.classSection ? " — " + student.classSection : ""}` : row.studentId;
        }
      },
      { key: "subjectId", header: "Subject" },
      { key: "marks", header: "Marks" },
      { key: "grade", header: "Grade" },
      {
        key: "published",
        header: "Published",
        render: (row: ResultRecord) => (row.published ? "Yes" : "No")
      },
      {
        key: "createdAt",
        header: "Uploaded at",
        render: (row: ResultRecord) => new Date(row.createdAt).toLocaleString()
      }
    ],
    [students]
  );

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="admin"
      title="Results Management"
      subtitle="Upload and review student marks and grades."
    >
      <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
        <Card>
          <div className="space-y-3 p-4 text-sm">
            <div className="font-medium text-xs mb-1">Upload result</div>
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
                <label className="block text-xs font-medium mb-1">Subject ID / Code</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.subjectId}
                  onChange={(e) => setForm((prev) => ({ ...prev, subjectId: e.target.value }))}
                  placeholder="Subject ObjectId or code"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Marks</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.marks}
                  onChange={(e) => setForm((prev) => ({ ...prev, marks: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Grade</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.grade}
                  onChange={(e) => setForm((prev) => ({ ...prev, grade: e.target.value }))}
                  placeholder="A+, B, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Marksheet URL (optional)</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={form.fileUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, fileUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-end gap-2">
                <input
                  id="published"
                  type="checkbox"
                  className="h-3 w-3"
                  checked={form.published}
                  onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
                />
                <label htmlFor="published" className="text-xs">
                  Published (visible to student)
                </label>
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
              <Button size="sm" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : "Save result"}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Loading recent results...</div>
          ) : (
            <DataTable data={results} columns={columns as never} />
          )}
        </Card>
      </div>
    </RoleLayout>
  );
}
