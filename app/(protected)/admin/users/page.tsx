"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import { exportCSV } from "@/src/lib/export";
import type { UserRole } from "@/types/roles";

type UserRecord = {
  _id: string;
  id?: string;
  name: string;
  role: UserRole;
  department?: string;
  hostelStatus?: boolean;
  roomNumber?: string;
  email?: string;
  hostel?: string;
};

export default function AdminUsersPage() {
  const { role, isLoaded } = useRoleGuard("admin");
  const { request } = useApi();
  const [records, setRecords] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");

  useEffect(() => {
    if (!isLoaded || !role) return;
    const fetchUsers = async () => {
      try {
        const payload = await request<{ data: UserRecord[] }>({
          method: "GET",
          url: "/users"
        });
        if (payload?.data) {
          setRecords(
            payload.data.map((user) => ({
              ...user,
              id: user._id || user.id,
              hostel: user.hostelStatus
                ? user.roomNumber || "Yes"
                : "No"
            })) as (UserRecord & { hostel: string })[]
          );
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [isLoaded, role, request]);

  const columns = useMemo(
    () => [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "role", header: "Role", render: (row: UserRecord) => row.role.toUpperCase() },
      { key: "department", header: "Department" },
      { key: "hostel", header: "Hostel" },
      {
        key: "actions",
        header: "Actions",
        render: (row: UserRecord) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setSelectedUser(row);
                setSelectedRole(row.role);
              }}
            >
              Change Role
            </Button>
            <ConfirmDialog
              title={`Deactivate ${row.name}?`}
              description="DELETE /api/users/:id performs a soft delete and invalidates refresh tokens."
              triggerLabel="Deactivate"
              variant="destructive"
              onConfirm={async () => {
                await request({
                  method: "DELETE",
                  url: `/users/${row.id || row._id}`
                });
                setRecords((prev) => prev.filter((user) => (user.id || user._id) !== (row.id || row._id)));
              }}
            />
          </div>
        )
      }
    ],
    [records, request]
  );

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="admin"
      title="User Management"
      subtitle="Manage custom-auth profiles, change roles, and deactivate access."
      actions={
        <Button
          variant="outline"
          onClick={() =>
            exportCSV(
              "users",
              records.map(({ id, _id, name, role, department, email }) => ({
                id: id || _id,
                name,
                email,
                role,
                department
              }))
            )
          }
        >
          Export CSV
        </Button>
      }
    >
      <Card>
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading users...</div>
        ) : (
          <DataTable data={records} columns={columns as never} />
        )}
      </Card>

      <Modal
        title={`Change Role — ${selectedUser?.name ?? ""}`}
        description="PUT /api/users/:id/role updates Mongo role + emits admin logs."
        open={Boolean(selectedUser)}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        {selectedUser && (
          <div className="space-y-4">
            <select
              className="w-full rounded-lg border border-border bg-transparent p-2 text-sm"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as UserRole)}
            >
              {["admin", "teacher", "student", "parent", "warden", "staff", "cafeteria", "security"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <Button
              onClick={async () => {
                await request({
                  method: "PUT",
                  url: `/users/${selectedUser.id || selectedUser._id}/role`,
                  data: { role: selectedRole }
                });
                setRecords((prev) =>
                  prev.map((user) =>
                    (user.id || user._id) === (selectedUser.id || selectedUser._id)
                      ? { ...user, role: selectedRole }
                      : user
                  )
                );
                setSelectedUser(null);
              }}
            >
              Save
            </Button>
          </div>
        )}
      </Modal>
    </RoleLayout>
  );
}

