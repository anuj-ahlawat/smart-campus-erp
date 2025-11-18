"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Scanner } from "@/components/qr/Scanner";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

export default function SecurityScanPage() {
  const { role, isLoaded } = useRoleGuard("security");
  const { request } = useApi();
  const [status, setStatus] = useState<string | null>(null);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout role="security" title="Gate Scanner" subtitle="POST /api/outpass/:id/scan">
      <Card>
        <Scanner
          onScan={async (payload) => {
            try {
              const parsed = JSON.parse(payload);
              const response = await request<{ data: { status: string } }>({
                method: "POST",
                url: `/outpass/${parsed.outpassId}/scan`,
                data: { payload: parsed }
              });
              setStatus(response?.data.status ?? "Unknown");
            } catch (error) {
              setStatus("Invalid QR");
            }
          }}
        />
        {status && (
          <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4">
            Gate response: <span className="font-semibold capitalize">{status}</span>
          </div>
        )}
      </Card>
    </RoleLayout>
  );
}

