"use client";

import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const tasks = [
  { id: "T-01", title: "Update lab inventory", status: "open" },
  { id: "T-02", title: "Escort guest lecture", status: "scheduled" }
];

export default function StaffDashboardPage() {
  const { role, isLoaded } = useRoleGuard("staff");
  if (!isLoaded || !role) return null;
  return (
    <RoleLayout role="staff" title="Staff Desk" subtitle="Campus errands + maintenance">
      <Card title="Action Items" actions={<Button size="sm">Log Work</Button>}>
        <DataTable
          data={tasks}
          columns={[
            { key: "id", header: "Task" },
            { key: "title", header: "Description" },
            { key: "status", header: "Status" }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}

