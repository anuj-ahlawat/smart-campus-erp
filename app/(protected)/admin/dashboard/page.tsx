"use client";

import { useEffect, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
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
  const { user, refresh } = useAuth() as ReturnType<typeof useAuth> & {
    refresh?: () => Promise<void> | void;
  };
  const [stats, setStats] = useState<DashboardStats>({
    students: 0,
    pendingOutpass: 0,
    hostelOccupancy: 0,
    incidents: 0
  });
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: ""
  });

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

  useEffect(() => {
    // Sync form with current user when it changes
    setForm({
      name: user?.name ?? "",
      phone: (user as any)?.phone ?? "",
      address: (user as any)?.address ?? ""
    });
  }, [user?.name, (user as any)?.phone, (user as any)?.address]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await request({
        method: "PATCH",
        url: "/auth/me",
        data: {
          name: form.name,
          phone: form.phone,
          address: form.address
        }
      });
      if (typeof refresh === "function") {
        await refresh();
      }
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to update admin profile", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout role="admin" title="Admin Mission Control" subtitle="High-level stats and quick links">
      <div className="mb-4 grid gap-4 md:grid-cols-[2fr,3fr]">
        <Card
          title="Admin profile"
          actions={
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              Edit profile
            </Button>
          }
        >
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
        <Card title="Key stats">
          {loading ? (
            <div className="text-center text-muted-foreground text-sm py-4">Loading statistics...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="rounded-lg border border-border bg-background px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Students</p>
                <p className="text-2xl font-semibold">{stats.students.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-border bg-background px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Pending Outpass</p>
                <p className="text-2xl font-semibold text-warning">{stats.pendingOutpass}</p>
              </div>
              <div className="rounded-lg border border-border bg-background px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Incidents Logged</p>
                <p className="text-2xl font-semibold">{stats.incidents}</p>
              </div>
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

      <Modal
        title="Edit admin profile"
        description="Update your basic contact information. College details come from institute setup."
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Phone</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                className="w-full rounded-md border border-border bg-muted px-2 py-1"
                value={user?.email ?? ""}
                disabled
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Email is managed at login level. Contact support if this needs to change.
              </p>
            </div>
            <div>
              <label className="block mb-1 font-medium">Address</label>
              <textarea
                className="w-full rounded-md border border-border bg-background px-2 py-1 min-h-[60px]"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </RoleLayout>
  );
}

