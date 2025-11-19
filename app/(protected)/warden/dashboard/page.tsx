"use client";

import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useAuth } from "@/hooks/useAuth";

export default function WardenDashboardPage() {
  const { role, isLoaded } = useRoleGuard("warden");
  const { user, status } = useAuth();

  if (!isLoaded || !role || status === "loading") {
    return <div className="p-8 text-center text-sm">Preparing warden dashboard…</div>;
  }

  return (
    <RoleLayout
      role="warden"
      title="Warden Dashboard"
      subtitle="Overview of your hostel responsibilities and profile."
    >
      <Card title="Warden Profile" subtitle="Your basic details for hostel management.">
        <div className="flex gap-6 text-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
              Photo
            </div>
            <div className="text-center">
              <div className="font-semibold text-base uppercase tracking-wide">
                {user?.name}
              </div>
              <div className="text-xs text-muted-foreground">Warden</div>
            </div>
          </div>
          <div className="flex-1 space-y-1 text-xs">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-right truncate max-w-[220px]">
                  {user?.email}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium text-right">{user?.department ?? "Hostel"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">College</span>
                <span className="font-medium text-right">Assigned college ID: {user?.collegeId}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </RoleLayout>
  );
}
