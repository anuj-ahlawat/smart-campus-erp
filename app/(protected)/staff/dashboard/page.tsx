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

      <Card title="Cafeteria" subtitle="Quick overview for cafeteria-related duties.">
        <div className="text-xs text-muted-foreground space-y-1 p-3">
          <p>Use this space to track cafeteria support tasks (stock checks, queue management, cleaning rounds).</p>
          <p className="mt-1">We can later wire this card to real cafeteria APIs when you are ready.</p>
        </div>
      </Card>
    </RoleLayout>
  );
}

