"use client";

import { useEffect, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";

type DashboardStats = {
  students: number;
  pendingOutpass: number;
  hostelOccupancy: number;
  incidents: number;
  totalRooms?: number;
  occupiedRooms?: number;
};

export default function AdminDashboardPage() {
  const { role, isLoaded } = useRoleGuard("admin");
  const { request } = useApi();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    students: 0,
    pendingOutpass: 0,
    hostelOccupancy: 0,
    incidents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !role) return;
    const fetchStats = async () => {
      try {
        const payload = await request<{ data: DashboardStats }>({
          method: "GET",
          url: "/admin/stats"
        });
        if (payload?.data) {
          setStats(payload.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isLoaded, role, request]);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout role="admin" title="Admin Mission Control" subtitle="High-level stats and quick links">
      <div className="mb-4 grid gap-4 md:grid-cols-[2fr,3fr]">
        <Card title="Admin profile">
          <div className="text-sm space-y-1">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{user?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-xs">{user?.email ?? "-"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <p className="text-xs text-muted-foreground">College</p>
                <p className="text-xs">{user?.collegeName ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-xs">{user?.phone ?? "-"}</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          {loading ? (
            <div className="text-center text-muted-foreground">Loading statistics...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <Card title="Students">
                <p className="text-3xl font-semibold">{stats.students.toLocaleString()}</p>
              </Card>
              <Card title="Pending Outpass">
                <p className="text-3xl font-semibold text-warning">{stats.pendingOutpass}</p>
              </Card>
              <Card title="Incidents Logged">
                <p className="text-3xl font-semibold">{stats.incidents}</p>
              </Card>
            </div>
          )}
        </Card>
      </div>

      {!loading && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Hostel Occupancy">
            <p className="text-3xl font-semibold">{stats.hostelOccupancy}%</p>
            {stats.totalRooms !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                {stats.occupiedRooms ?? 0} / {stats.totalRooms} rooms
              </p>
            )}
          </Card>
        </div>
      )}
    </RoleLayout>
  );
}

