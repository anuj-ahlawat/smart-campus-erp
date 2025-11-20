"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type TimetableSlot = {
  _id: string;
  classSection: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  subjectId?: { _id: string; name?: string; code?: string } | string;
};

type Row = {
  id: string;
  dayLabel: string;
  time: string;
  subjectLabel: string;
  subjectCode?: string;
  classSection: string;
  room?: string;
};

export default function TeacherTimetablePage() {
  const router = useRouter();
  const { role, isLoaded } = useRoleGuard("teacher");
  const { request } = useApi();

  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const loadSlots = async () => {
    try {
      setLoading(true);
      const payload = await request<{ data: TimetableSlot[] }>({ method: "GET", url: "/timetable" });
      setSlots(payload?.data ?? []);
    } catch (error) {
      console.error("Failed to load teacher timetable", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !role) return;
    void loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, role]);

  const rows: Row[] = useMemo(() => {
    const date = new Date(selectedDate);
    const dow = date.getDay();
    return slots
      .filter((slot) => slot.dayOfWeek === dow)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((slot) => {
        const subjectLabel =
          typeof slot.subjectId === "string"
            ? slot.subjectId
            : slot.subjectId?.code || slot.subjectId?.name || "Subject";
        const subjectCode = typeof slot.subjectId === "string" ? undefined : slot.subjectId?.code;
        return {
          id: slot._id,
          dayLabel: DAY_LABELS[slot.dayOfWeek] ?? String(slot.dayOfWeek),
          time: `${slot.startTime} – ${slot.endTime}`,
          subjectLabel,
          subjectCode,
          classSection: slot.classSection,
          room: slot.room
        };
      });
  }, [slots, selectedDate]);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="teacher"
      title="Timetable"
      subtitle="View your classes for the selected day and jump to attendance."
    >
      <Card title="Timetable">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-xs"
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().slice(0, 10));
              }}
            >
              {"<"}
            </Button>
            <span className="text-xs font-medium">
              {new Date(selectedDate).toLocaleDateString(undefined, {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric"
              })}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-xs"
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().slice(0, 10));
              }}
            >
              {">"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadSlots} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
        {loading && !slots.length ? (
          <div className="py-6 text-center text-xs text-muted-foreground">Loading timetable...</div>
        ) : rows.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No classes scheduled for {DAY_LABELS[new Date(selectedDate).getDay()]}
          </div>
        ) : (
          <DataTable
            data={rows}
            columns={[
              { key: "time", header: "Time" },
              { key: "subjectLabel", header: "Subject" },
              { key: "classSection", header: "Class" },
              { key: "room", header: "Room" },
              {
                key: "actions",
                header: "Actions",
                render: (row: Row) => (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const query = new URLSearchParams();
                      query.set("class", row.classSection);
                      if (row.subjectCode) query.set("subject", row.subjectCode);
                      query.set("date", selectedDate);
                      router.push(`/teacher/attendance?${query.toString()}`);
                    }}
                  >
                    Mark attendance
                  </Button>
                )
              }
            ] as never}
          />
        )}
      </Card>
    </RoleLayout>
  );
}
