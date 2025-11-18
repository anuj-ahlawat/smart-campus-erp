"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Scanner } from "@/components/qr/Scanner";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import type { UserRole } from "@/types/roles";

export default function CafeteriaScanPage() {
  const { role, isLoaded } = useRoleGuard(["cafeteria", "security"]);
  const { request } = useApi();
  const [result, setResult] = useState<string | null>(null);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout role={(role ?? "cafeteria") as UserRole} title="Meal Scanner">
      <Card subtitle="POST /api/cafeteria/scan">
        <Scanner
          onScan={async (payload) => {
            await request({
              method: "POST",
              url: "/cafeteria/scan",
              data: { payload }
            });
            setResult(payload);
          }}
        />
        {result && (
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 text-sm">
            Last Scan Payload: {result}
          </div>
        )}
      </Card>
    </RoleLayout>
  );
}

