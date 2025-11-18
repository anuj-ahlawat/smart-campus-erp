"use client";

import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const rows = [
  { subject: "AI Theory", percentage: "92%", status: "Healthy" },
  { subject: "IoT Lab", percentage: "84%", status: "Watch" }
];

export default function ParentAttendancePage() {
  const { role, isLoaded } = useRoleGuard("parent");
  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="parent"
      title="Attendance summary"
      subtitle="GET /api/attendance/student/:studentId?start=&end= populates this dashboard."
    >
      <Card title="Subjects">
        <DataTable
          data={rows}
          columns={[
            { key: "subject", header: "Subject" },
            { key: "percentage", header: "Attendance" },
            { key: "status", header: "Status" }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}


