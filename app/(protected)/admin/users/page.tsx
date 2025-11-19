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
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole | "all">("student");
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "student" as UserRole,
    department: "",
    classSection: "",
    hostelStatus: false,
    roomNumber: "",
    password: "",
    admissionNo: "",
    phone: "",
    address: "",
    course: "",
    parentEmail: "",
    subject: "",
    staffDepartment: ""
  });

  const fetchUsers = async (roleFilter: UserRole | "all") => {
    try {
      setLoading(true);
      const payload = await request<{ data: UserRecord[] }>({
        method: "GET",
        url: roleFilter === "all" ? "/users" : `/users?role=${roleFilter}`
      });
      if (payload?.data) {
        setRecords(
          payload.data.map((user) => ({
            ...user,
            id: user._id || user.id,
            hostel: user.hostelStatus ? user.roomNumber || "Yes" : "No"
          })) as (UserRecord & { hostel: string })[]
        );
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !role) return;
    void fetchUsers(activeRoleTab);
  }, [activeRoleTab, isLoaded, role, request]);

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    const payload: Record<string, unknown> = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      password: newUser.password
    };

    if (newUser.phone) payload.phone = newUser.phone;
    if (newUser.address) payload.address = newUser.address;

    if (newUser.role === "student") {
      if (newUser.admissionNo) payload.admissionNo = newUser.admissionNo;
      if (newUser.department) payload.department = newUser.department;
      if (newUser.classSection) payload.classSection = newUser.classSection;
      if (newUser.course) payload.course = newUser.course;
      payload.hostelStatus = newUser.hostelStatus;
      if (newUser.hostelStatus && newUser.roomNumber) {
        payload.roomNumber = newUser.roomNumber;
      }
      if (newUser.parentEmail) {
        // backend does not yet have a dedicated parentEmail field; send for future use
        payload.parentEmail = newUser.parentEmail;
      }
    } else if (newUser.role === "teacher") {
      if (newUser.department) payload.department = newUser.department;
      if (newUser.classSection) payload.classSection = newUser.classSection;
      if (newUser.subject) payload.subject = newUser.subject;
    } else if (newUser.role === "staff") {
      if (newUser.staffDepartment) {
        payload.department = newUser.staffDepartment;
      }
    } else if (newUser.role === "warden") {
      if (newUser.department) payload.department = newUser.department;
    }
    await request({
      method: "POST",
      url: "/users",
      data: payload
    });
    setAddOpen(false);
    setNewUser({
      name: "",
      email: "",
      role: activeRoleTab === "all" ? "student" : (activeRoleTab as UserRole),
      department: "",
      classSection: "",
      hostelStatus: false,
      roomNumber: "",
      password: "",
      admissionNo: "",
      phone: "",
      address: "",
      course: "",
      parentEmail: "",
      subject: "",
      staffDepartment: ""
    });
    void fetchUsers(activeRoleTab);
  };

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
      subtitle="Create users per role, view separate lists, change roles, and deactivate access."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            Add user
          </Button>
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
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {["student", "teacher", "parent", "warden", "staff", "admin", "all"].map((value) => (
          <button
            key={value}
            className={
              activeRoleTab === value
                ? "rounded-full bg-primary px-3 py-1 text-primary-foreground"
                : "rounded-full bg-muted px-3 py-1 text-muted-foreground"
            }
            onClick={() => setActiveRoleTab(value as UserRole | "all")}
          >
            {value === "all" ? "All" : value.charAt(0).toUpperCase() + value.slice(1)}s
          </button>
        ))}
      </div>

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

      <Modal
        title="Add User"
        description="Create a new user account for this college. A login password will be saved for the selected role."
        open={addOpen}
        onOpenChange={(open) => {
          if (!open) setAddOpen(false);
        }}
      >
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Name</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={newUser.name}
                onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Email</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={newUser.email}
                onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Role</label>
              <select
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={newUser.role}
                onChange={(event) =>
                  setNewUser((prev) => ({ ...prev, role: event.target.value as UserRole }))
                }
              >
                {(["student", "teacher", "parent", "warden", "staff"] as UserRole[]).map((value) => (
                  <option key={value} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={newUser.password}
                onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
              />
            </div>
          </div>
          {newUser.role === "student" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Department</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={newUser.department}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, department: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Class / Section</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={newUser.classSection}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, classSection: event.target.value }))
                  }
                />
              </div>
            </div>
          )}
          {newUser.role === "teacher" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Department</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={newUser.department}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, department: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Subject</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={newUser.subject}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, subject: event.target.value }))
                  }
                />
              </div>
            </div>
          )}
          {newUser.role === "staff" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Staff Department</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={newUser.staffDepartment}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, staffDepartment: event.target.value }))
                  }
                >
                  <option value="">Select</option>
                  <option value="security">Security</option>
                  <option value="cafeteria">Cafeteria</option>
                  <option value="laundry">Laundry</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}
          {newUser.role === "warden" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Department / Block</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={newUser.department}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, department: event.target.value }))
                  }
                />
              </div>
            </div>
          )}
          {newUser.role === "student" && (
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-medium mb-1">Hosteller</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={newUser.hostelStatus ? "yes" : "no"}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, hostelStatus: event.target.value === "yes" }))
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Room number (optional)</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={newUser.roomNumber}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, roomNumber: event.target.value }))
                  }
                  disabled={!newUser.hostelStatus}
                />
              </div>
            </div>
          )}
          {(newUser.role === "student" || newUser.role === "teacher" || newUser.role === "staff" || newUser.role === "warden") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Phone number</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={newUser.phone}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Address</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={newUser.address}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, address: event.target.value }))
                  }
                />
              </div>
            </div>
          )}
          {newUser.role === "student" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Admission number</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={newUser.admissionNo}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, admissionNo: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Course</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={newUser.course}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, course: event.target.value }))
                  }
                />
              </div>
            </div>
          )}
          {newUser.role === "student" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Parent email</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={newUser.parentEmail}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, parentEmail: event.target.value }))
                  }
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateUser}>
              Save user
            </Button>
          </div>
        </div>
      </Modal>
    </RoleLayout>
  );
}

