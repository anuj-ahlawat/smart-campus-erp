"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

const overrides = [
  { id: "OPS-600", student: "Dev", status: "waiting", parent: "approved", warden: "pending" }
];

export default function AdminOutpassPage() {
  const { role, isLoaded } = useRoleGuard("admin");
  const { request } = useApi();
  const [records, setRecords] = useState(overrides);
  if (!isLoaded || !role) return null;

  return (
    <RoleLayout role="admin" title="Outpass Overrides" subtitle="Escalations from warden/security">
      <Card>
        <DataTable
          data={records}
          columns={[
            { key: "id", header: "Ticket" },
            { key: "student", header: "Student" },
            { key: "parent", header: "Parent" },
            { key: "warden", header: "Warden" },
            {
              key: "action",
              header: "Override",
              render: (row) => (
                <Button
                  size="sm"
                  onClick={async () => {
                    await request({
                      method: "PUT",
                      url: `/outpass/${row.id}/admin-override`,
                      data: { status: "approved" }
                    });
                    setRecords((prev) =>
                      prev.map((record) => (record.id === row.id ? { ...record, status: "approved" } : record))
                    );
                  }}
                >
                  Approve Override
                </Button>
              )
            }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}

