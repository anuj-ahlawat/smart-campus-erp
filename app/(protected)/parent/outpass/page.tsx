"use client";

import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const history = [
  { id: "OPS-210", reason: "Medical", status: "approved", dates: "Aug 1 - Aug 2" },
  { id: "OPS-211", reason: "Event", status: "pending", dates: "Aug 5 - Aug 6" }
];

export default function ParentOutpassPage() {
  const { role, isLoaded } = useRoleGuard("parent");
  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="parent"
      title="Outpass tracker"
      subtitle="History is fetched from GET /api/outpass/student/:studentId and matches dashboard approvals."
    >
      <Card>
        <DataTable
          data={history}
          columns={[
            { key: "id", header: "Ticket" },
            { key: "reason", header: "Reason" },
            { key: "dates", header: "Dates" },
            { key: "status", header: "Status" }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}


