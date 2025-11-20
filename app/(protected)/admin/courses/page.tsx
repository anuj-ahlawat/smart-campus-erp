"use client";

import { useEffect, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

 type CourseRow = {
  _id: string;
  code: string;
  title: string;
  credits: number;
  semester: number;
  academicYear: string;
};

export default function AdminCoursesPage() {
  const { role, isLoaded } = useRoleGuard("admin");
  const { request } = useApi();
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: "",
    title: "",
    credits: 0,
    semester: 1,
    academicYear: ""
  });

  useEffect(() => {
    if (!isLoaded || !role) return;
    const load = async () => {
      try {
        setLoading(true);
        const payload = await request<{ data: CourseRow[] }>({ method: "GET", url: "/courses" });
        setRows(payload?.data ?? []);
      } catch (error) {
        console.error("Failed to load courses", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isLoaded, role, request]);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="admin"
      title="Courses"
      subtitle="Manage course catalog: code, title and credits per semester."
      actions={
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          Add course
        </Button>
      }
    >
      <Card>
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading courses...</div>
        ) : (
          <DataTable
            data={rows}
            columns={[
              { key: "semester", header: "Semester" },
              { key: "code", header: "Course code" },
              { key: "title", header: "Course title" },
              { key: "credits", header: "Credits" },
              { key: "academicYear", header: "Academic year" }
            ]}
          />
        )}
      </Card>

      <Modal
        title="Add course"
        description="Create a new course for this college."
        open={addOpen}
        onOpenChange={setAddOpen}
      >
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Course code</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={newCourse.code}
                onChange={(e) => setNewCourse((prev) => ({ ...prev, code: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Credits</label>
              <input
                type="number"
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={newCourse.credits}
                onChange={(e) => setNewCourse((prev) => ({ ...prev, credits: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Course title</label>
            <input
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
              value={newCourse.title}
              onChange={(e) => setNewCourse((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Semester</label>
              <input
                type="number"
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={newCourse.semester}
                onChange={(e) => setNewCourse((prev) => ({ ...prev, semester: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Academic year</label>
              <input
                placeholder="2023-2024"
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={newCourse.academicYear}
                onChange={(e) => setNewCourse((prev) => ({ ...prev, academicYear: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                await request({
                  method: "POST",
                  url: "/courses",
                  data: newCourse
                });
                const payload = await request<{ data: CourseRow[] }>({ method: "GET", url: "/courses" });
                setRows(payload?.data ?? []);
                setAddOpen(false);
                setNewCourse({ code: "", title: "", credits: 0, semester: 1, academicYear: "" });
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </RoleLayout>
  );
}
