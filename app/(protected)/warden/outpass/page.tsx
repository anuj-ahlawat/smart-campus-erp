"use client";

import { useEffect, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

type QueueRow = {
  _id: string;
  type: string;
  reason: string;
  studentId?: { name?: string };
};

export default function WardenOutpassPage() {
  const { role, isLoaded } = useRoleGuard("warden");
  const { request } = useApi();
  const [records, setRecords] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !role) return;
    const load = async () => {
      try {
        const payload = await request<{ data: QueueRow[] }>({ method: "GET", url: "/outpass/queue" });
        if (payload?.data) setRecords(payload.data);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isLoaded, role, request]);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="warden"
      title="Outpass Queue"
      subtitle="Approvals trigger PUT /api/outpass/:id/warden-approve and emit socket outpassStatusChanged"
    >
      <Card>
        {loading ? (
          <div className="py-8 text-xs text-muted-foreground text-center">Loading pending outpasses…</div>
        ) : (
          <DataTable
            data={records}
            columns={[
              { key: "_id", header: "Ticket" },
              {
                key: "student",
                header: "Student",
                render: (row: QueueRow) => row.studentId?.name ?? "—"
              },
              { key: "reason", header: "Reason" },
              { key: "type", header: "Type" },
              {
                key: "actions",
                header: "Actions",
                render: (row: QueueRow) => (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        await request({
                          method: "PUT",
                          url: `/outpass/${row._id}/warden-approve`,
                          data: { decision: "approved" }
                        });
                        setRecords((prev) => prev.filter((record) => record._id !== row._id));
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
                          url: `/outpass/${row._id}/warden-approve`,
                          data: { decision: "rejected" }
                        });
                        setRecords((prev) => prev.filter((record) => record._id !== row._id));
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                )
              }
            ]}
          />
        )}
      </Card>
    </RoleLayout>
  );
}

