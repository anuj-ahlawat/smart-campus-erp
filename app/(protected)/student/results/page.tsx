"use client";

import { useEffect, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";

type ResultRow = {
  _id: string;
  subjectId: string;
  marks?: number;
  grade?: string;
  published: boolean;
  createdAt: string;
};

export default function StudentResultsPage() {
  const { role, isLoaded } = useRoleGuard("student");
  const { user } = useAuth();
  const { request } = useApi();
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !role || !user) return;
    const load = async () => {
      try {
        setLoading(true);
        const payload = await request<{ data: ResultRow[] }>({
          method: "GET",
          url: `/results/student/${user.id}`
        });
        if (payload?.data) {
          setRows(payload.data.filter((item) => item.published));
        }
      } catch (error) {
        console.error("Failed to load results", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isLoaded, role, user, request]);

  if (!isLoaded || !role || !user) return null;

  return (
    <RoleLayout
      role="student"
      title="Final result"
      subtitle="View your published results uploaded by the college."
    >
      <Card title="Published results" subtitle="Only results marked as published by the college are shown here.">
        <div className="border border-border rounded-lg overflow-hidden text-xs md:text-sm">
          <div className="grid grid-cols-5 bg-muted px-3 py-2 font-medium text-muted-foreground">
            <div>SUBJECT</div>
            <div>MARKS</div>
            <div>GRADE</div>
            <div>PUBLISHED</div>
            <div className="text-right">UPLOADED AT</div>
          </div>
          {loading ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">Loading results...</div>
          ) : rows.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">No results published yet.</div>
          ) : (
            <div className="divide-y">
              {rows.map((row) => (
                <div key={row._id} className="grid grid-cols-5 items-center px-3 py-2 gap-2">
                  <div className="text-xs text-muted-foreground line-clamp-1">{row.subjectId}</div>
                  <div>{row.marks ?? "-"}</div>
                  <div>{row.grade ?? "-"}</div>
                  <div>{row.published ? "Yes" : "No"}</div>
                  <div className="text-right">{new Date(row.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </RoleLayout>
  );
}


