"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const schedule = [
  { time: "09:00", subject: "AI Theory", classId: "CSE-A", room: "B102" },
  { time: "11:00", subject: "DSA Lab", classId: "CSE-A", room: "LAB-3" },
  { time: "14:00", subject: "IoT Project", classId: "ECE-B", room: "C203" }
];

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { role, isLoaded } = useRoleGuard("teacher");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(schedule[0]?.classId ?? "");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="teacher"
      title="Faculty Dashboard"
      subtitle="Lesson schedule + rapid attendance + notes upload."
      actions={
        <Button onClick={() => setSelectorOpen(true)}>
          Mark Attendance
        </Button>
      }
    >
      <Card title="Today's Classes" subtitle="Tap row → attendance view">
        <DataTable
          data={schedule}
          columns={[
            { key: "time", header: "Time" },
            { key: "subject", header: "Subject" },
            { key: "classId", header: "Class" },
            { key: "room", header: "Room" },
            {
              key: "action",
              header: "Actions",
              render: (row) => (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push(`/teacher/attendance?class=${row.classId}&subject=${row.subject}`)
                  }
                >
                  Take Attendance
                </Button>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title="Select class & date"
        description="POST /api/attendance/mark expects classId, subjectId, date, present[]"
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Class</label>
            <select
              className="mt-1 w-full rounded-lg border border-border bg-transparent p-2 text-sm"
              value={selectedClass}
              onChange={(event) => setSelectedClass(event.target.value)}
            >
              {schedule.map((slot) => (
                <option key={slot.classId} value={slot.classId}>
                  {slot.classId} — {slot.subject}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-border bg-transparent p-2 text-sm"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => {
              router.push(`/teacher/attendance?class=${selectedClass}&date=${selectedDate}`);
              setSelectorOpen(false);
            }}
          >
            Continue
          </Button>
        </div>
      </Modal>
    </RoleLayout>
  );
}

