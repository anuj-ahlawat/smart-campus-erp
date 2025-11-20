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
  email: string;
  classSection?: string;
};

type ResultRow = {
  _id: string;
  subjectId: string;
  marks?: number;
  grade?: string;
  published: boolean;
  createdAt: string;
};

export default function ParentResultsPage() {
  const { role, isLoaded } = useRoleGuard("parent");
  const { user } = useAuth();
  const { request } = useApi();
  const [child, setChild] = useState<ChildRecord | null>(null);
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);

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
        console.error("Failed to load child for parent results", error);
      }
    };
    void loadChild();
  }, [isLoaded, role, user, request]);

  useEffect(() => {
    if (!isLoaded || !role || !child) return;
    const loadResults = async () => {
      try {
        setLoading(true);
        const payload = await request<{ data: ResultRow[] }>({
          method: "GET",
          url: `/results/student/${child._id}`
        });
        if (payload?.data) {
          setRows(payload.data.filter((item) => item.published));
        }
      } catch (error) {
        console.error("Failed to load child results", error);
      } finally {
        setLoading(false);
      }
    };
    void loadResults();
  }, [isLoaded, role, child, request]);

  if (!isLoaded || !role || !user) return null;

  return (
    <RoleLayout
      role="parent"
      title="Child results"
      subtitle="Select a child to view their published results."
    >
      <Card>
        {loading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Loading results...</div>
        ) : !child ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No mapped child found. Ensure the student's parent email matches your login email.
          </div>
        ) : rows.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">No published results for this child yet.</div>
        ) : (
          <DataTable
            data={rows}
            columns={[
              { key: "subjectId", header: "Subject" },
              { key: "marks", header: "Marks" },
              { key: "grade", header: "Grade" },
              {
                key: "createdAt",
                header: "Published at",
                render: (row: ResultRow) => new Date(row.createdAt).toLocaleString()
              }
            ]}
          />
        )}
      </Card>
    </RoleLayout>
  );
}


