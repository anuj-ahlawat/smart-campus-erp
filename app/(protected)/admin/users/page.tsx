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
  classSection?: string;
  hostelStatus?: boolean;
  roomNumber?: string;
  email?: string;
  phone?: string;
  parentEmail?: string;
  hostel?: string;
};

export default function AdminUsersPage() {
  const { role, isLoaded } = useRoleGuard("admin");
  const { request } = useApi();
  const [records, setRecords] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    classSection: "",
    hostelStatus: false,
    roomNumber: "",
    parentEmail: ""
  });
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
  const [courses, setCourses] = useState<{ code: string; title: string; semester: number }[]>([]);

  useEffect(() => {
    if (!isLoaded || !role) return;
    const loadCourses = async () => {
      try {
        const payload = await request<{ data: { code: string; title: string; semester: number }[] }>({
          method: "GET",
          url: "/courses"
        });
        setCourses(payload?.data ?? []);
      } catch (error) {
        console.error("Failed to load courses", error);
      }
    };
    void loadCourses();
  }, [isLoaded, role, request]);

  // When creating a teacher, if no teachingSubjects are chosen yet, pre-select up to 3 random subjects
  useEffect(() => {
    const teachingSubjects = ((newUser as any).teachingSubjects as string[] | undefined) ?? [];
    if (newUser.role !== "teacher") return;
    if (teachingSubjects.length) return;
    if (!courses.length) return;

    const pool = courses.filter((c) => c.semester >= 1 && c.semester <= 5);
    if (!pool.length) return;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(3, shuffled.length)).map((c) => c.code);
    if (!picked.length) return;

    setNewUser((prev) => ({ ...(prev as any), teachingSubjects: picked } as any));
  }, [newUser.role, courses]);

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
      if (Array.isArray((newUser as any).teachingSubjects) && (newUser as any).teachingSubjects.length) {
        payload.teachingSubjects = (newUser as any).teachingSubjects;
      }
    } else if (newUser.role === "staff") {
      // Route specialised staff to the right portal by setting their role
      if (newUser.staffDepartment === "cafeteria") {
        payload.role = "cafeteria";
      } else if (newUser.staffDepartment === "security") {
        payload.role = "security";
      } else if (newUser.staffDepartment) {
        // e.g. laundry or other support staff stay under generic staff role
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
              variant="outline"
              onClick={() => {
                setEditUser(row);
                setEditForm({
                  name: row.name,
                  email: row.email ?? "",
                  phone: row.phone ?? "",
                  department: row.department ?? "",
                  classSection: row.classSection ?? "",
                  hostelStatus: row.hostelStatus ?? false,
                  roomNumber: row.roomNumber ?? "",
                  parentEmail: row.parentEmail ?? ""
                });
              }}
            >
              Edit Profile
            </Button>
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
        title={`Edit Profile  ${editUser?.name ?? ""}`}
        description="PUT /api/users/:id updates core user profile fields."
        open={Boolean(editUser)}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
      >
        {editUser && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Parent email</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={editForm.parentEmail}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, parentEmail: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block mb-1 font-medium">Department</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, department: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Class / Section</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={editForm.classSection}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, classSection: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Hosteller</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={editForm.hostelStatus ? "yes" : "no"}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, hostelStatus: e.target.value === "yes" }))
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium">Room number</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                  value={editForm.roomNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, roomNumber: e.target.value }))
                  }
                  disabled={!editForm.hostelStatus}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditUser(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  if (!editUser) return;
                  const payload: Record<string, unknown> = {
                    name: editForm.name,
                    email: editForm.email,
                    phone: editForm.phone,
                    department: editForm.department,
                    classSection: editForm.classSection,
                    hostelStatus: editForm.hostelStatus,
                    parentEmail: editForm.parentEmail
                  };
                  if (editForm.hostelStatus && editForm.roomNumber) {
                    payload.roomNumber = editForm.roomNumber;
                  } else {
                    payload.roomNumber = "";
                  }

                  const response = await request<{ data: UserRecord }>({
                    method: "PUT",
                    url: `/users/${editUser.id || editUser._id}`,
                    data: payload
                  });
                  const updated = response?.data;
                  if (updated) {
                    setRecords((prev) =>
                      prev.map((u) =>
                        (u.id || u._id) === (editUser.id || editUser._id)
                          ? {
                              ...u,
                              ...updated,
                              id: updated._id || updated.id,
                              hostel: updated.hostelStatus
                                ? updated.roomNumber || "Yes"
                                : "No"
                            }
                          : u
                      )
                    );
                  }
                  setEditUser(null);
                }}
              >
                Save changes
              </Button>
            </div>
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
            <div className="space-y-3">
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
                  <label className="block text-xs font-medium mb-1">Subject (short label)</label>
                  <input
                    className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                    value={newUser.subject}
                    onChange={(event) =>
                      setNewUser((prev) => ({ ...prev, subject: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Teaching subjects (choose up to 3 from Sem 1-5)</label>
                <div className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs h-28 overflow-y-auto space-y-1">
                  {courses
                    .filter((c) => c.semester >= 1 && c.semester <= 5)
                    .map((course) => {
                      const selected = (((newUser as any).teachingSubjects as string[]) ?? []).includes(
                        course.code
                      );
                      const currentSelected =
                        (((newUser as any).teachingSubjects as string[]) ?? []).length || 0;
                      const disableNewCheck = !selected && currentSelected >= 3;
                      return (
                        <label key={course.code} className="flex items-start gap-1">
                          <input
                            type="checkbox"
                            className="mt-[2px]"
                            checked={selected}
                            disabled={disableNewCheck}
                            onChange={(event) => {
                              const prevSelected =
                                (((newUser as any).teachingSubjects as string[]) ?? []);
                              if (event.target.checked) {
                                if (prevSelected.includes(course.code)) return;
                                if (prevSelected.length >= 3) return;
                                setNewUser((prev) =>
                                  ({
                                    ...(prev as any),
                                    teachingSubjects: [...prevSelected, course.code]
                                  } as any)
                                );
                              } else {
                                setNewUser((prev) =>
                                  ({
                                    ...(prev as any),
                                    teachingSubjects: prevSelected.filter((c) => c !== course.code)
                                  } as any)
                                );
                              }
                            }}
                          />
                          <span>{`${course.code} (Sem ${course.semester}) — ${course.title}`}</span>
                        </label>
                      );
                    })}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">Select up to 3 subjects using the checkboxes above.</p>
                {((newUser as any).teachingSubjects as string[] | undefined)?.length ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-[11px] font-medium">Selected subjects:</p>
                    <ul className="text-[11px] list-disc list-inside space-y-0.5">
                      {((newUser as any).teachingSubjects as string[]).map((code) => {
                        const course = courses.find((c) => c.code === code);
                        return (
                          <li key={code}>{course ? `${course.code} (Sem ${course.semester}) — ${course.title}` : code}</li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
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

