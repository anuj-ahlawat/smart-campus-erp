"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useApi } from "@/hooks/useApi";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import type { UserRole } from "@/types/roles";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";
type MenuItem = { name: string; price: number; available: boolean; mealType: MealType };

export default function CafeteriaMenuPage() {
  const { role, isLoaded } = useRoleGuard(["cafeteria", "staff"]);
  const { request } = useApi();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<MenuItem[]>([
    { name: "Paneer Bowl", price: 80, available: true, mealType: "lunch" }
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
      <Card title="Items" subtitle="Mark each dish as Breakfast, Lunch, Snack or Dinner and publish for students.">
        <DataTable
          data={items}
          columns={[
            {
              key: "mealType",
              header: "Meal",
              render: (row, index) => (
                <select
                  className="w-28 rounded-md border border-border bg-transparent p-1 text-xs"
                  value={row.mealType}
                  onChange={(event) =>
                    setItems((prev) =>
                      prev.map((item, idx) =>
                        idx === index
                          ? { ...item, mealType: event.target.value as MealType }
                          : item
                      )
                    )
                  }
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snack">Snack</option>
                  <option value="dinner">Dinner</option>
                </select>
              )
            },
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
          onClick={() =>
            setItems((prev) => [
              ...prev,
              { name: "New Item", price: 0, available: true, mealType: "lunch" }
            ])
          }
        >
          Add Item
        </Button>
      </Card>
    </RoleLayout>
  );
}

