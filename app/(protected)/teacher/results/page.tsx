"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import type { UserRole } from "@/types/roles";

type StudentRow = {
  studentId: string;
  name: string;
  marks: number | "";
};

export default function TeacherResultsPage() {
  const { role, isLoaded } = useRoleGuard(["teacher", "admin"]);
  const { request } = useApi();

  const [classSection, setClassSection] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examLabel, setExamLabel] = useState("");
  const [published, setPublished] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const canLoadStudents = useMemo(() => !!classSection, [classSection]);
  const canSubmit = useMemo(
    () =>
      !!classSection &&
      !!subjectId &&
      students.some((s) => typeof s.marks === "number" && !Number.isNaN(s.marks)),
    [classSection, subjectId, students]
  );

  const loadStudents = async () => {
    if (!classSection) return;
    try {
      setLoading(true);
      const payload = await request<{ data: { _id: string; name: string }[] }>({
        method: "GET",
        url: `/users?role=student&classSection=${encodeURIComponent(classSection)}`
      });
      const list = payload?.data ?? [];
      setStudents(list.map((s) => ({ studentId: s._id, name: s.name, marks: "" })));
    } catch (error) {
      console.error("Failed to load students for results", error);
    } finally {
      setLoading(false);
    }
  };

  const submitResults = async () => {
    if (!canSubmit) return;
    const payload = students
      .filter((s) => typeof s.marks === "number" && !Number.isNaN(s.marks))
      .map((s) => ({
        studentId: s.studentId,
        subjectId,
        marks: s.marks,
        grade: undefined,
        published
      }));

    await request({
      method: "POST",
      url: "/results/upload",
      data: payload
    });

    // Optionally clear marks after submit
    setStudents((prev) => prev.map((s) => ({ ...s, marks: "" })));
  };

  useEffect(() => {
    // Auto-load students when classSection changes and is non-empty
    if (!canLoadStudents) return;
    void loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoadStudents]);

  const columns = useMemo(
    () => [
      { key: "studentId", header: "ID" },
      { key: "name", header: "Student" },
      {
        key: "marks",
        header: "Marks",
        render: (row: StudentRow) => (
          <input
            type="number"
            min={0}
            className="w-20 rounded-md border border-border bg-background px-1 py-0.5 text-xs"
            value={row.marks}
            onChange={(event) => {
              const value = event.target.value;
              const numeric = value === "" ? "" : Number(value);
              setStudents((prev) =>
                prev.map((s) => (s.studentId === row.studentId ? { ...s, marks: numeric } : s))
              );
            }}
          />
        )
      }
    ],
    [students]
  );

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role={(role ?? "teacher") as UserRole}
      title="Upload Marks"
      subtitle="Select a class and subject, then enter marks per student and publish when ready."
      actions={
        <Button size="sm" onClick={submitResults} disabled={!canSubmit}>
          Save results
        </Button>
      }
    >
      <Card subtitle="Results entered here are stored via POST /api/results/upload.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 text-xs mb-4">
          <div>
            <label className="block mb-1 font-medium">Class / Section</label>
            <input
              className="w-full rounded-md border border-border bg-background px-2 py-1"
              value={classSection}
              onChange={(e) => setClassSection(e.target.value)}
              placeholder="e.g. CSE-A"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Subject ID / Code</label>
            <input
              className="w-full rounded-md border border-border bg-background px-2 py-1"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              placeholder="e.g. CSET381"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Exam / Assessment label (optional)</label>
            <input
              className="w-full rounded-md border border-border bg-background px-2 py-1"
              value={examLabel}
              onChange={(e) => setExamLabel(e.target.value)}
              placeholder="e.g. Midterm, Quiz 1"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 text-xs">
          <Button size="sm" variant="outline" onClick={loadStudents} disabled={!canLoadStudents || loading}>
            {loading ? "Loading students..." : "Load students"}
          </Button>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <span>Publish immediately</span>
          </label>
        </div>

        {students.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            {classSection
              ? "No students loaded yet. Click 'Load students' to fetch the class list."
              : "Enter a class/section to begin."}
          </div>
        ) : (
          <DataTable data={students} columns={columns as never} />
        )}
      </Card>
    </RoleLayout>
  );
}


