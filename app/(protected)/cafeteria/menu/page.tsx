"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useApi } from "@/hooks/useApi";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import type { UserRole } from "@/types/roles";

type MenuItem = { name: string; price: number; available: boolean };

export default function CafeteriaMenuPage() {
  const { role, isLoaded } = useRoleGuard(["cafeteria", "staff"]);
  const { request } = useApi();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<MenuItem[]>([
    { name: "Paneer Bowl", price: 80, available: true }
  ]);

  const publishMenu = async () => {
    await request({
      method: "POST",
      url: "/cafeteria/menu",
      data: { date, items }
    });
  };

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role={(role ?? "cafeteria") as UserRole}
      title="Menu Builder"
      subtitle="Button posts to /api/cafeteria/menu and emits menuPublished socket event"
      actions={
        <Button onClick={publishMenu}>
          Publish Today’s Menu
        </Button>
      }
    >
      <Card title="Schedule">
        <label className="text-sm font-medium">Serving Date</label>
        <input
          type="date"
          className="mt-1 w-full rounded-lg border border-border bg-transparent p-2 text-sm"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </Card>
      <Card title="Items">
        <DataTable
          data={items}
          columns={[
            { key: "name", header: "Item" },
            {
              key: "price",
              header: "Price",
              render: (row, index) => (
                <input
                  type="number"
                  className="w-24 rounded-md border border-border bg-transparent p-1 text-sm"
                  value={row.price}
                  onChange={(event) =>
                    setItems((prev) =>
                      prev.map((item, idx) => (idx === index ? { ...item, price: Number(event.target.value) } : item))
                    )
                  }
                />
              )
            },
            {
              key: "available",
              header: "Available",
              render: (row, index) => (
                <input
                  type="checkbox"
                  checked={row.available}
                  onChange={(event) =>
                    setItems((prev) =>
                      prev.map((item, idx) => (idx === index ? { ...item, available: event.target.checked } : item))
                    )
                  }
                />
              )
            }
          ]}
        />
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setItems((prev) => [...prev, { name: "New Item", price: 0, available: true }])}
        >
          Add Item
        </Button>
      </Card>
    </RoleLayout>
  );
}

