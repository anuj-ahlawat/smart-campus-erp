"use client";

import { useEffect, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";

type ChildRecord = {
  _id: string;
  name: string;
};

type OutpassHistoryRow = {
  id: string;
  reason: string;
  dates: string;
  status: string;
};

export default function ParentOutpassPage() {
  const { role, isLoaded } = useRoleGuard("parent");
  const { user } = useAuth();
  const { request } = useApi();
  const [child, setChild] = useState<ChildRecord | null>(null);
  const [history, setHistory] = useState<OutpassHistoryRow[]>([]);

  useEffect(() => {
    if (!isLoaded || !role || !user) return;
    const loadChild = async () => {
      try {
        const payload = await request<{ data: ChildRecord[] }>({
          method: "GET",
          url: `/users?role=student&parentEmail=${encodeURIComponent(user.email)}`
        });
        if (payload?.data && payload.data.length > 0) {
          setChild(payload.data[0]);
        }
      } catch (error) {
        console.error("Failed to load child for parent outpass page", error);
      }
    };
    void loadChild();
  }, [isLoaded, role, user, request]);

  useEffect(() => {
    if (!child) return;
    const loadHistory = async () => {
      try {
        const payload = await request<{ data: any[] }>({
          method: "GET",
          url: `/outpass/student/${child._id}`
        });
        const rows: OutpassHistoryRow[] = (payload?.data || []).map((item) => ({
          id: item._id,
          reason: item.reason ?? "-",
          dates: item.dateRange ?? "-",
          status: item.status ?? item.parentApproval ?? "-"
        }));
        setHistory(rows);
      } catch (error) {
        console.error("Failed to load outpass history for parent", error);
      }
    };
    void loadHistory();
  }, [child, request]);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="parent"
      title="Outpass tracker"
      subtitle="History is fetched from GET /api/outpass/student/:studentId and matches dashboard approvals."
    >
      <Card>
        <DataTable
          data={history}
          columns={[
            { key: "id", header: "Ticket" },
            { key: "reason", header: "Reason" },
            { key: "dates", header: "Dates" },
            { key: "status", header: "Status" }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}


