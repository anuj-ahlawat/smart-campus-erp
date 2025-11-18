"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

const queue = [
  { id: "OPS-500", student: "Nisha", reason: "Conference", type: "leave" },
  { id: "OPS-501", student: "Raghav", reason: "Family", type: "day" }
];

export default function WardenOutpassPage() {
  const { role, isLoaded } = useRoleGuard("warden");
  const { request } = useApi();
  const [records, setRecords] = useState(queue);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="warden"
      title="Outpass Queue"
      subtitle="Approvals trigger PUT /api/outpass/:id/warden-approve and emit socket outpassStatusChanged"
    >
      <Card>
        <DataTable
          data={records}
          columns={[
            { key: "id", header: "Ticket" },
            { key: "student", header: "Student" },
            { key: "reason", header: "Reason" },
            { key: "type", header: "Type" },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await request({
                        method: "PUT",
                        url: `/outpass/${row.id}/warden-approve`,
                        data: { decision: "approved" }
                      });
                      setRecords((prev) => prev.filter((record) => record.id !== row.id));
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await request({
                        method: "PUT",
                        url: `/outpass/${row.id}/warden-approve`,
                        data: { decision: "rejected" }
                      });
                      setRecords((prev) => prev.filter((record) => record.id !== row.id));
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await request({
                        method: "PUT",
                        url: `/outpass/${row.id}/warden-approve`,
                        data: { decision: "needs-info" }
                      });
                    }}
                  >
                    Request More Info
                  </Button>
                </div>
              )
            }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}

