"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/table";
import { Scanner } from "@/components/qr/Scanner";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

const todayMenu = [
  { name: "Paneer Bowl", price: 80, available: true },
  { name: "Veg Pulao", price: 65, available: true }
];

export default function StudentCafeteriaPage() {
  const { role, isLoaded } = useRoleGuard("student");
  const { request } = useApi();
  const [scannerOpen, setScannerOpen] = useState(false);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="student"
      title="Cafeteria"
      subtitle="Menu sourced from GET /api/cafeteria/menu?date=YYYY-MM-DD. Scanner logs meals via POST /api/cafeteria/scan."
      actions={
        <Button variant="outline" onClick={() => setScannerOpen(true)}>
          Scan meal QR
        </Button>
      }
    >
      <Card title="Today's Menu">
        <DataTable
          data={todayMenu}
          columns={[
            { key: "name", header: "Item" },
            { key: "price", header: "Price" },
            {
              key: "available",
              header: "Status",
              render: (row) => (row.available ? "Available" : "Sold out")
            }
          ]}
        />
      </Card>
      <Modal
        title="Scan meal QR"
        description="QR payload is sent to POST /api/cafeteria/scan and logs in CafeteriaLog."
        open={scannerOpen}
        onOpenChange={setScannerOpen}
      >
        <Scanner
          onScan={async (payload) => {
            await request({
              method: "POST",
              url: "/cafeteria/scan",
              data: { payload }
            });
            setScannerOpen(false);
          }}
        />
      </Modal>
    </RoleLayout>
  );
}


