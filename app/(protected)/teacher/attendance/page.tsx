"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import type { UserRole } from "@/types/roles";

type AttendanceRow = {
  studentId: string;
  name: string;
  present: boolean;
  attendanceId?: string;
};

export default function TeacherAttendancePage() {
  const searchParams = useSearchParams();
  const { role, isLoaded } = useRoleGuard(["teacher", "admin"]);
  const { request } = useApi();

  const classId = searchParams.get("class") ?? "";
  const subjectId = searchParams.get("subject") ?? "";
  const dateParam = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  const [selectedDate, setSelectedDate] = useState<string>(dateParam);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialStatus, setInitialStatus] = useState<Record<string, boolean>>({});
  const [initialAttendanceIds, setInitialAttendanceIds] = useState<Record<string, string | undefined>>({});

  const loadData = async (classSection: string, dateStr: string) => {
    if (!classSection) return;
    try {
      setLoading(true);

      // 1) Load students of this class
      const usersPayload = await request<{ data: { _id: string; name: string }[] }>({
        method: "GET",
        url: `/users?role=student&classSection=${encodeURIComponent(classSection)}`
      });
      const students = usersPayload?.data ?? [];

      // 2) Load existing attendance for this class + date
      const attendancePayload = await request<{
        data: { _id: string; studentId: string; status: string }[];
      }>({
        method: "GET",
        url: `/attendance/class/${encodeURIComponent(classSection)}?date=${encodeURIComponent(dateStr)}`
      });
      const attendance = attendancePayload?.data ?? [];

      const byStudent: Record<string, { present: boolean; attendanceId?: string }> = {};
      for (const record of attendance) {
        byStudent[record.studentId] = {
          present: record.status === "present",
          attendanceId: record._id
        };
      }

      const nextRows: AttendanceRow[] = students.map((student) => {
        const existing = byStudent[student._id];
        return {
          studentId: student._id,
          name: student.name,
          present: existing ? existing.present : false,
          attendanceId: existing?.attendanceId
        };
      });

      const statusSnapshot: Record<string, boolean> = {};
      const idSnapshot: Record<string, string | undefined> = {};
      nextRows.forEach((row) => {
        statusSnapshot[row.studentId] = row.present;
        idSnapshot[row.studentId] = row.attendanceId;
      });

      setRows(nextRows);
      setInitialStatus(statusSnapshot);
      setInitialAttendanceIds(idSnapshot);
    } catch (error) {
      console.error("Failed to load attendance data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !role) return;
    void loadData(classId, selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, role, classId, selectedDate]);

  const saveAttendance = async () => {
    if (!classId) return;

    const isoDate = new Date(selectedDate).toISOString();

    const existingAny = Object.values(initialAttendanceIds).some((id) => Boolean(id));

    if (!existingAny) {
      // First-time marking for this date: use bulk mark endpoint
      const presentIds = rows.filter((row) => row.present).map((row) => row.studentId);
      await request({
        method: "POST",
        url: "/attendance/mark",
        data: {
          classId,
          subjectId,
          date: isoDate,
          present: presentIds
        }
      });
      await loadData(classId, selectedDate);
      return;
    }

    // Editing existing records: update changed ones and insert new present marks if needed
    const updates: Promise<unknown>[] = [];
    const newlyPresent: string[] = [];

    for (const row of rows) {
      const before = initialStatus[row.studentId] ?? false;
      const after = row.present;
      const attendanceId = initialAttendanceIds[row.studentId];

      if (attendanceId) {
        if (before !== after) {
          updates.push(
            request({
              method: "PUT",
              url: `/attendance/${attendanceId}`,
              data: { status: after ? "present" : "absent" }
            })
          );
        }
      } else if (after) {
        // No previous record but now present → create via mark endpoint later
        newlyPresent.push(row.studentId);
      }
    }

    if (newlyPresent.length) {
      updates.push(
        request({
          method: "POST",
          url: "/attendance/mark",
          data: {
            classId,
            subjectId,
            date: isoDate,
            present: newlyPresent
          }
        })
      );
    }

    await Promise.all(updates);
    await loadData(classId, selectedDate);
  };

  const columns = useMemo(
    () => [
      { key: "studentId", header: "ID" },
      { key: "name", header: "Student" },
      {
        key: "present",
        header: "Present",
        render: (row: AttendanceRow) => (
          <input
            type="checkbox"
            checked={row.present}
            onChange={(event) =>
              setRows((prev) =>
                prev.map((r) => (r.studentId === row.studentId ? { ...r, present: event.target.checked } : r))
              )
            }
          />
        )
      }
    ],
    []
  );

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role={(role ?? "teacher") as UserRole}
      title={`Attendance • ${classId || "Select class"}`}
      subtitle="Toggle presence for each student, then save to create or update attendance records."
      actions={
        <Button onClick={saveAttendance} disabled={!classId || rows.length === 0}>
          Save Attendance
        </Button>
      }
    >
      <Card subtitle="Class-wise attendance for the selected date.">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div>
            <span className="font-medium">Class:</span> {classId || "Not specified"}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Date:</span>
            <input
              type="date"
              className="rounded-md border border-border bg-background px-2 py-1"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <div className="py-6 text-center text-xs text-muted-foreground">Loading students...</div>
        ) : rows.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No students found for this class.
          </div>
        ) : (
          <DataTable data={rows} columns={columns as never} />
        )}
      </Card>
    </RoleLayout>
  );
}

