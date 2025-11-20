"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

type TimetableSlotRow = {
  _id: string;
  classSection: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  subjectId?: { _id: string; name?: string; code?: string } | string;
  teacherId?: { _id: string; name?: string; email?: string } | string;
};

type CourseRow = { code: string; title: string; semester?: number };

type TeacherRow = { _id: string; name: string; email?: string };

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminTimetablePage() {
  const { role, isLoaded } = useRoleGuard("admin");
  const { request } = useApi();

  const [classFilter, setClassFilter] = useState("");
  const [slots, setSlots] = useState<TimetableSlotRow[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    classSection: "",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "10:00",
    subjectId: "",
    teacherId: "",
    room: ""
  });

  const canCreate = useMemo(
    () =>
      !!form.classSection &&
      form.dayOfWeek >= 0 &&
      !!form.startTime &&
      !!form.endTime &&
      !!form.subjectId &&
      !!form.teacherId,
    [form]
  );

  const loadSlots = async (cls: string) => {
    try {
      setLoadingSlots(true);
      const params = cls ? `?classSection=${encodeURIComponent(cls)}` : "";
      const payload = await request<{ data: TimetableSlotRow[] }>({
        method: "GET",
        url: `/timetable${params}`
      });
      setSlots(payload?.data ?? []);
    } catch (error) {
      console.error("Failed to load timetable slots", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [coursesPayload, teachersPayload] = await Promise.all([
        request<{ data: CourseRow[] }>({ method: "GET", url: "/courses" }),
        request<{ data: TeacherRow[] }>({ method: "GET", url: "/users?role=teacher" })
      ]);
      setCourses(coursesPayload?.data ?? []);
      setTeachers(teachersPayload?.data ?? []);
    } catch (error) {
      console.error("Failed to load courses/teachers", error);
    }
  };

  const handleCreate = async () => {
    if (!canCreate) return;
    setCreating(true);
    try {
      await request({
        method: "POST",
        url: "/timetable",
        data: form
      });
      await loadSlots(classFilter || form.classSection);
      setForm((prev) => ({ ...prev, startTime: "09:00", endTime: "10:00", room: "" }));
    } catch (error) {
      console.error("Failed to create timetable slot", error);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !role) return;
    void loadSlots("");
    void loadOptions();
  }, [isLoaded, role]);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="admin"
      title="Class Timetable"
      subtitle="Create and view timetable slots per class, based on courses and teachers."
    >
      <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
        <Card title="Create slot" subtitle="Define a new timetable entry for a class.">
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium">Class / Section</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={form.classSection}
                  onChange={(e) => setForm((prev) => ({ ...prev, classSection: e.target.value }))}
                  placeholder="e.g. CSE-A"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Day of week</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={form.dayOfWeek}
                  onChange={(e) => setForm((prev) => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                >
                  {DAY_LABELS.map((label, idx) => (
                    <option key={idx} value={idx}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium">Start time</label>
                <input
                  type="time"
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={form.startTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">End time</label>
                <input
                  type="time"
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={form.endTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium">Course (subject)</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={form.subjectId}
                  onChange={(e) => setForm((prev) => ({ ...prev, subjectId: e.target.value }))}
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} {c.semester ? `(Sem ${c.semester})` : ""} — {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Teacher</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={form.teacherId}
                  onChange={(e) => setForm((prev) => ({ ...prev, teacherId: e.target.value }))}
                >
                  <option value="">Select teacher</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} {t.email ? `(${t.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Room (optional)</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.room}
                onChange={(e) => setForm((prev) => ({ ...prev, room: e.target.value }))}
                placeholder="e.g. LH-104"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleCreate} disabled={!canCreate || creating}>
                {creating ? "Saving..." : "Save slot"}
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Existing slots" subtitle="Filter by class to view a specific section's timetable.">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium">Filter by class:</span>
              <input
                className="rounded-md border border-border bg-background px-2 py-1"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                placeholder="e.g. CSE-A (leave empty for all)"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => void loadSlots(classFilter)}
                disabled={loadingSlots}
              >
                {loadingSlots ? "Loading..." : "Apply"}
              </Button>
            </div>
          </div>
          {slots.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No timetable slots found yet.
            </div>
          ) : (
            <DataTable
              data={slots}
              columns={[
                { key: "classSection", header: "Class" },
                {
                  key: "dayOfWeek",
                  header: "Day",
                  render: (row: TimetableSlotRow) => DAY_LABELS[row.dayOfWeek] ?? row.dayOfWeek
                },
                { key: "startTime", header: "Start" },
                { key: "endTime", header: "End" },
                {
                  key: "subjectId",
                  header: "Subject",
                  render: (row: TimetableSlotRow) =>
                    typeof row.subjectId === "string"
                      ? row.subjectId
                      : row.subjectId?.code || row.subjectId?.name || "Subject"
                },
                {
                  key: "teacherId",
                  header: "Teacher",
                  render: (row: TimetableSlotRow) =>
                    typeof row.teacherId === "string" ? row.teacherId : row.teacherId?.name || "-"
                },
                { key: "room", header: "Room" }
              ] as never}
            />
          )}
        </Card>
      </div>
    </RoleLayout>
  );
}
