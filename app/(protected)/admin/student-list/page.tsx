"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

type StudentRow = {
  _id: string;
  name: string;
  email?: string;
  department?: string;
  course?: string;
  classSection?: string;
  semester?: string;
  admissionNo?: string;
  hostelStatus?: boolean;
  roomNumber?: string;
};

export default function AdminStudentListPage() {
  const { role, isLoaded } = useRoleGuard("admin");
  const { request } = useApi();

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [classSection, setClassSection] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("role", "student");
      if (department.trim()) params.set("department", department.trim());
      if (course.trim()) params.set("course", course.trim());
      if (classSection.trim()) params.set("classSection", classSection.trim());
      const payload = await request<{ data: StudentRow[] }>({
        method: "GET",
        url: `/users?${params.toString()}`
      });
      setStudents(payload?.data ?? []);
    } catch (error) {
      console.error("Failed to load students", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !role) return;
    void loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, role]);

  const columns = useMemo(
    () => [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "department", header: "Department" },
      { key: "course", header: "Course" },
      { key: "classSection", header: "Class / Section" },
      { key: "semester", header: "Semester" },
      {
        key: "hostelStatus",
        header: "Hostel",
        render: (row: StudentRow) => (row.hostelStatus ? row.roomNumber || "Hosteller" : "Dayscholar")
      }
    ],
    []
  );

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="admin"
      title="Students by Department / Course / Class"
      subtitle="Filter and view student records by academic grouping."
    >
      <div className="space-y-4">
        <Card>
          <div className="flex flex-wrap gap-3 items-end text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-medium">Department</label>
              <input
                className="rounded-md border border-border bg-background px-2 py-1 min-w-[150px]"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. CSE"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Course</label>
              <input
                className="rounded-md border border-border bg-background px-2 py-1 min-w-[150px]"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. B.Tech CSE"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Class / Section</label>
              <input
                className="rounded-md border border-border bg-background px-2 py-1 min-w-[120px]"
                value={classSection}
                onChange={(e) => setClassSection(e.target.value)}
                placeholder="e.g. CSE-A"
              />
            </div>
            <div className="flex gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDepartment("");
                  setCourse("");
                  setClassSection("");
                  void loadStudents();
                }}
              >
                Reset
              </Button>
              <Button size="sm" onClick={() => void loadStudents()} disabled={loading}>
                {loading ? "Loading..." : "Apply filters"}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          {loading && !students.length ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading students...</div>
          ) : !students.length ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No students found.</div>
          ) : (
            <DataTable data={students} columns={columns as never} />
          )}
        </Card>
      </div>
    </RoleLayout>
  );
}
