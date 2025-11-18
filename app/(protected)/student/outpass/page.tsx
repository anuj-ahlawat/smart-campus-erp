"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/table";
import { QRModal } from "@/components/qr/QRModal";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import { generateQRPayload } from "@/src/lib/generateQRPayload";

const sampleOutpasses = [
  { id: "OPS-231", status: "approved", reason: "Family visit", qrCode: "signedPayload" },
  { id: "OPS-232", status: "pending", reason: "Medical", qrCode: "" },
  { id: "OPS-233", status: "rejected", reason: "Conflicts exam", qrCode: "" }
];

export default function StudentOutpassListPage() {
  const { role, isLoaded } = useRoleGuard("student");
  const { request } = useApi();
  const [records, setRecords] = useState(sampleOutpasses);

  if (!isLoaded || !role) return null;

  const columns = useMemo(
    () => [
      { key: "id", header: "Ticket" },
      { key: "reason", header: "Reason" },
      {
        key: "status",
        header: "Status",
        render: (row: (typeof sampleOutpasses)[0]) => (
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold capitalize"
            data-status={row.status}
          >
            {row.status}
          </span>
        )
      },
      {
        key: "actions",
        header: "Actions",
        render: (row: (typeof sampleOutpasses)[0]) => (
          <div className="flex gap-2">
            {row.status === "approved" && (
              <QRModal value={generateQRPayload(row.id, row.qrCode)} label="View QR" />
            )}
            {row.status === "pending" && (
              <ConfirmDialog
                title="Cancel this outpass?"
                description="This marks the request as cancelled and notifies hostel/security."
                triggerLabel="Cancel Request"
                variant="destructive"
                onConfirm={async () => {
                  await request({
                    method: "PUT",
                    url: `/outpass/${row.id}/cancel`,
                    data: { status: "cancelled" }
                  });
                  setRecords((prev) =>
                    prev.map((record) =>
                      record.id === row.id ? { ...record, status: "cancelled" } : record
                    )
                  );
                }}
              />
            )}
            <Button size="sm" variant="outline" asChild>
              <Link href={`/student/outpass/${row.id}`}>View</Link>
            </Button>
          </div>
        )
      }
    ],
    [request]
  );

  return (
    <RoleLayout role="student" title="Outpass Tracker" subtitle="View workflow, statuses and QR codes">
      <Card
        title="Status Reference"
        subtitle="Pending → parent → warden → admin override → QR"
      >
        <ul className="list-disc pl-6 text-sm text-muted-foreground">
          <li>GET /api/outpass/student/:studentId populates this table.</li>
          <li>Pending rows show “Cancel Request” and hit PUT /api/outpass/:id with status cancelled.</li>
          <li>Approved rows display QR payload via GET /api/qr/outpass/:id.</li>
        </ul>
      </Card>
      <Card title="My Outpasses">
        <DataTable data={records} columns={columns as never} />
      </Card>
    </RoleLayout>
  );
}

