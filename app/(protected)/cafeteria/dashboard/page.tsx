"use client";

import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { useRoleGuard } from "@/hooks/useRoleGuard";

export default function CafeteriaDashboardPage() {
  const { role, isLoaded } = useRoleGuard("cafeteria");
  if (!isLoaded || !role) return null;
  return (
    <RoleLayout role="cafeteria" title="Cafeteria Ops" subtitle="Glance menus and logs">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Meals served" subtitle="Today">
          <p className="text-3xl font-semibold">420</p>
        </Card>
        <Card title="Menu status" subtitle="Lunch">
          <p className="text-3xl font-semibold text-success">Published</p>
        </Card>
        <Card title="Low inventory" subtitle="Rice, Paneer">
          <p className="text-sm text-muted-foreground">Restock by 4 PM</p>
        </Card>
      </div>
    </RoleLayout>
  );
}

