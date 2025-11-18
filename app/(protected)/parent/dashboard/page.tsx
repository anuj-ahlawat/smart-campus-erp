"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

const pendingOutpasses = [
  { id: "OPS-310", student: "Ishaan", reason: "Hackathon", status: "pending" },
  { id: "OPS-311", student: "Ishaan", reason: "Medical", status: "pending" }
];

export default function ParentDashboardPage() {
  const { role, isLoaded } = useRoleGuard("parent");
  const { request } = useApi();
  const [records, setRecords] = useState(pendingOutpasses);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="parent"
      title="Parent Overview"
      subtitle="Approve or reject outpasses. Buttons hit PUT /api/outpass/:id/parent-approve."
    >
      <Card title="Child Snapshot">
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-muted-foreground">Attendance</p>
            <p className="text-2xl font-semibold">91%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fee Status</p>
            <p className="text-2xl font-semibold text-success">Cleared</p>
          </div>
          <div>
            <p className="text-muted-foreground">Hostel Room</p>
            <p className="text-2xl font-semibold">H-203</p>
          </div>
        </div>
      </Card>
      <Card title="Pending Outpasses" subtitle="Approve → notify student + warden">
        <DataTable
          data={records}
          columns={[
            { key: "id", header: "Ticket" },
            { key: "student", header: "Student" },
            { key: "reason", header: "Reason" },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await request({
                        method: "PUT",
                        url: `/outpass/${row.id}/parent-approve`,
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
                        url: `/outpass/${row.id}/parent-approve`,
                        data: { decision: "rejected" }
                      });
                      setRecords((prev) => prev.filter((record) => record.id !== row.id));
                    }}
                  >
                    Reject
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

