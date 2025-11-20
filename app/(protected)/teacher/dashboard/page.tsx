"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";

type TimetableSlot = {
  _id: string;
  classSection: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  subjectId?: { _id: string; name?: string; code?: string };
};

type TodayRow = {
  id: string;
  time: string;
  subjectLabel: string;
  subjectCode?: string;
  classSection: string;
  room?: string;
};

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { role, isLoaded } = useRoleGuard("teacher");
  const { request } = useApi();
  const { user, refresh } = useAuth() as ReturnType<typeof useAuth> & {
    refresh?: () => Promise<void> | void;
  };
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    if (!isLoaded || !role) return;
    const load = async () => {
      try {
        setLoading(true);
        const payload = await request<{ data: TimetableSlot[] }>({ method: "GET", url: "/timetable" });
        const allSlots = payload?.data ?? [];
        setSlots(allSlots);
      } catch (error) {
        console.error("Failed to load timetable", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isLoaded, role, request]);

  const todayRows: TodayRow[] = useMemo(() => {
    const today = new Date().getDay();
    return slots
      .filter((slot) => slot.dayOfWeek === today)
      .map((slot) => ({
        id: slot._id,
        time: `${slot.startTime} – ${slot.endTime}`,
        subjectLabel: slot.subjectId?.code || slot.subjectId?.name || "Subject",
        subjectCode: slot.subjectId?.code,
        classSection: slot.classSection,
        room: slot.room
      }));
  }, [slots]);

  useEffect(() => {
    if (!todayRows.length) return;
    setSelectedClass(todayRows[0].classSection);
    setSelectedSubjectCode(todayRows[0].subjectCode || "");
  }, [todayRows.length]);

  useEffect(() => {
    // Sync form with current teacher user when it changes
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
      console.error("Failed to update teacher profile", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="teacher"
      title="Faculty Dashboard"
      subtitle="Today's classes and quick links to mark attendance."
      actions={
        <Button onClick={() => setSelectorOpen(true)} disabled={!todayRows.length}>
          Mark Attendance
        </Button>
      }
    >
      <div className="mb-4 grid gap-4 md:grid-cols-[2fr,3fr]">
        <Card
          title="Faculty profile"
          actions={
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              Edit profile
            </Button>
          }
        >
          <div className="space-y-1 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{user?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-xs">{user?.email ?? "-"}</p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-xs">{(user as any)?.department ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-xs">{(user as any)?.phone ?? "-"}</p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Primary class</p>
                <p className="text-xs">{(user as any)?.classSection ?? "-"}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Today's Classes" subtitle="Tap row → attendance view">
          {loading ? (
            <div className="py-6 text-center text-xs text-muted-foreground">Loading timetable...</div>
          ) : todayRows.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No classes scheduled for today.
            </div>
          ) : (
            <DataTable
              data={todayRows}
              columns={[
                { key: "time", header: "Time" },
                { key: "subjectLabel", header: "Subject" },
                { key: "classSection", header: "Class" },
                { key: "room", header: "Room" },
                {
                  key: "action",
                  header: "Actions",
                  render: (row: TodayRow) => (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/teacher/attendance?class=${encodeURIComponent(
                            row.classSection
                          )}&subject=${encodeURIComponent(row.subjectCode || row.subjectLabel)}`
                        )
                      }
                    >
                      Take Attendance
                    </Button>
                  )
                }
              ]}
            />
          )}
        </Card>
      </div>
      <Modal
        title="Select class & date"
        description="POST /api/attendance/mark expects classId, subjectId, date, present[]"
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Class & Subject</label>
            <select
              className="mt-1 w-full rounded-lg border border-border bg-transparent p-2 text-sm"
              value={`${selectedClass}__${selectedSubjectCode}`}
              onChange={(event) => {
                const [cls, subj] = event.target.value.split("__");
                setSelectedClass(cls);
                setSelectedSubjectCode(subj || "");
              }}
            >
              {todayRows.map((row) => (
                <option key={row.id} value={`${row.classSection}__${row.subjectCode || ""}`}>
                  {row.classSection} – {row.subjectLabel}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-border bg-transparent p-2 text-sm"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>
          <Button
            className="w-full"
            disabled={!selectedClass}
            onClick={() => {
              const query = new URLSearchParams();
              query.set("class", selectedClass);
              if (selectedSubjectCode) query.set("subject", selectedSubjectCode);
              query.set("date", selectedDate);
              router.push(`/teacher/attendance?${query.toString()}`);
              setSelectorOpen(false);
            }}
          >
            Continue
          </Button>
        </div>
      </Modal>

      <Modal
        title="Edit faculty profile"
        description="Update your basic contact information. College details come from institute setup."
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-medium">Name</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block font-medium">Phone</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="mb-1 block font-medium">Email</label>
              <input
                className="w-full rounded-md border border-border bg-muted px-2 py-1"
                value={user?.email ?? ""}
                disabled
              />
            </div>
            <div>
              <label className="mb-1 block font-medium">Address</label>
              <textarea
                className="min-h-[60px] w-full rounded-md border border-border bg-background px-2 py-1"
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

