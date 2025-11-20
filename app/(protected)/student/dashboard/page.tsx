"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { StudentProfileCard } from "@/components/student/StudentProfileCard";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useApi } from "@/hooks/useApi";

export default function StudentDashboardPage() {
  const { role, isLoaded } = useRoleGuard("student");
  const { user, status, refresh } = useAuth() as ReturnType<typeof useAuth> & {
    refresh?: () => Promise<void> | void;
  };
  const { request } = useApi();

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [emergencyError, setEmergencyError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: (user as any)?.phone || "",
    admissionNo: (user as any)?.admissionNo || "",
    admissionYear: (user as any)?.admissionYear || "",
    rollNo: (user as any)?.rollNo || "",
    degree: (user as any)?.degree || "",
    course: (user as any)?.course || "",
    department: (user as any)?.department || "",
    semester: (user as any)?.semester || "",
    classSection: (user as any)?.classSection || "",
    hostelStatus: (user as any)?.hostelStatus ?? false,
    roomNumber: (user as any)?.roomNumber || "",
    guardianPhone: (user as any)?.guardianPhone || "",
    address: (user as any)?.address || ""
  });

  if (!isLoaded || !role || status === "loading") {
    return <div className="p-8 text-center">Preparing dashboard…</div>;
  }

  const profile = {
    name: user?.name,
    email: user?.email,
    admissionNo: (user as any)?.admissionNo,
    admissionYear: (user as any)?.admissionYear,
    rollNo: (user as any)?.rollNo,
    degree: (user as any)?.degree,
    course: (user as any)?.course,
    department: (user as any)?.department,
    semester: (user as any)?.semester,
    collegeName: (user as any)?.collegeName,
    address: (user as any)?.address,
    classSection: (user as any)?.classSection,
    hostelStatus: (user as any)?.hostelStatus,
    roomNumber: (user as any)?.roomNumber
  };

  const handleEmergencyHelp = async () => {
    setEmergencyError(null);

    if (!("geolocation" in navigator)) {
      setEmergencyError("Location services not available on this device.");
      alert("Location services are not available on this device.");
      return;
    }

    setEmergencyLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });

      const { latitude, longitude, accuracy } = position.coords;

      await request({
        method: "POST",
        url: "/emergency-alerts",
        data: {
          latitude,
          longitude,
          accuracy
        }
      });

      alert(
        "Emergency alert sent to security.\nStay where you are if safe. Help is on the way."
      );
    } catch (error) {
      console.error("Failed to send emergency alert", error);
      setEmergencyError(
        "Failed to send emergency alert. Please try again or contact security directly."
      );
      alert("Failed to send emergency alert. Please try again or contact security directly.");
    } finally {
      setEmergencyLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await request({
        method: "PATCH",
        url: "/auth/me",
        data: {
          name: form.name,
          phone: form.phone,
          admissionNo: form.admissionNo,
          admissionYear: form.admissionYear,
          rollNo: form.rollNo,
          degree: form.degree,
          course: form.course,
          department: form.department,
          semester: form.semester,
          classSection: form.classSection,
          hostelStatus: form.hostelStatus,
          roomNumber: form.roomNumber,
          guardianPhone: form.guardianPhone,
          address: form.address
        }
      });
      if (typeof refresh === "function") {
        await refresh();
      }
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleLayout
      role="student"
      title="Student Dashboard"
      subtitle="Academic summary and personal profile overview."
      actions={
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="danger"
            onClick={handleEmergencyHelp}
            disabled={emergencyLoading}
          >
            {emergencyLoading ? "Sending..." : "Emergency Help"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
            Edit profile
          </Button>
        </div>
      }
    >
      <StudentProfileCard
        profile={profile}
        title="Student profile"
        subtitle="Core academic and hostel details pulled from your college records."
      />

      {emergencyError && (
        <div className="mt-2 text-xs text-red-600">
          {emergencyError}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border bg-card/40 p-4 text-xs md:p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Profile details</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <div className="flex text-[11px]">
              <span className="w-28 text-muted-foreground">Name</span>
              <span className="flex-1 font-medium">{user?.name ?? "-"}</span>
            </div>
            <div className="flex text-[11px]">
              <span className="w-28 text-muted-foreground">Phone</span>
              <span className="flex-1">{(user as any)?.phone ?? "-"}</span>
            </div>
            <div className="flex text-[11px]">
              <span className="w-28 text-muted-foreground">Guardian phone</span>
              <span className="flex-1">{(user as any)?.guardianPhone ?? "-"}</span>
            </div>
            <div className="flex text-[11px]">
              <span className="w-28 text-muted-foreground">Hostel</span>
              <span className="flex-1">
                {(user as any)?.hostelStatus ? "Hosteller" : "Dayscholar"}
                {(user as any)?.roomNumber ? ` • Room ${String((user as any).roomNumber)}` : ""}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex text-[11px]">
              <span className="w-28 text-muted-foreground">Admission no.</span>
              <span className="flex-1">{(user as any)?.admissionNo ?? "-"}</span>
            </div>
            <div className="flex text-[11px]">
              <span className="w-28 text-muted-foreground">Roll no.</span>
              <span className="flex-1">{(user as any)?.rollNo ?? "-"}</span>
            </div>
            <div className="flex text-[11px]">
              <span className="w-28 text-muted-foreground">Department</span>
              <span className="flex-1">{(user as any)?.department ?? "-"}</span>
            </div>
            <div className="flex text-[11px]">
              <span className="w-28 text-muted-foreground">Course</span>
              <span className="flex-1">{(user as any)?.course ?? "-"}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 border-t border-border pt-3 text-[11px]">
          <div className="flex">
            <span className="w-28 text-muted-foreground">Address</span>
            <span className="flex-1 whitespace-pre-wrap">{(user as any)?.address ?? "-"}</span>
          </div>
        </div>
      </div>

      <Modal
        title="Edit profile"
        description="Update your academic and hostel details. Some fields may be locked by your college admin."
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 font-medium">Admission no.</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.admissionNo}
                onChange={(e) => setForm((prev) => ({ ...prev, admissionNo: e.target.value }))}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Admission year</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.admissionYear}
                onChange={(e) => setForm((prev) => ({ ...prev, admissionYear: e.target.value }))}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Roll no.</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.rollNo}
                onChange={(e) => setForm((prev) => ({ ...prev, rollNo: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 font-medium">Degree</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.degree}
                onChange={(e) => setForm((prev) => ({ ...prev, degree: e.target.value }))}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Course</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.course}
                onChange={(e) => setForm((prev) => ({ ...prev, course: e.target.value }))}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Semester</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.semester}
                onChange={(e) => setForm((prev) => ({ ...prev, semester: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 font-medium">Department</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.department}
                onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Class / Section</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.classSection}
                onChange={(e) => setForm((prev) => ({ ...prev, classSection: e.target.value }))}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Hostel status</label>
              <select
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.hostelStatus ? "hosteller" : "dayscholar"}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, hostelStatus: e.target.value === "hosteller" }))
                }
              >
                <option value="dayscholar">Dayscholar</option>
                <option value="hosteller">Hosteller</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium">Room</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.roomNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, roomNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Guardian phone</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.guardianPhone}
                onChange={(e) => setForm((prev) => ({ ...prev, guardianPhone: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <textarea
              className="w-full rounded-md border border-border bg-background px-2 py-1 min-h-[60px]"
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </RoleLayout>
  );
}