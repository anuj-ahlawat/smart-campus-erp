"use client";

import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const timetable = [
  { day: "Monday", time: "09:00 - 10:00", subject: "AI Theory", room: "B-203" },
  { day: "Monday", time: "10:00 - 11:00", subject: "DSA", room: "B-205" },
  { day: "Tuesday", time: "09:00 - 11:00", subject: "IoT Lab", room: "Lab-4" }
];

export default function StudentTimetablePage() {
  const { role, isLoaded } = useRoleGuard("student");
  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="student"
      title="Weekly Timetable"
      subtitle="Data is fetched from GET /api/timetable?classSection=CSE-A. Admin/teacher CRUD lives under /admin/settings."
    >
      <Card>
        <DataTable
          data={timetable}
          columns={[
            { key: "day", header: "Day" },
            { key: "time", header: "Slot" },
            { key: "subject", header: "Subject" },
            { key: "room", header: "Room" }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}


