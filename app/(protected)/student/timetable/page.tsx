"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";

type TimetableSlot = {
  _id: string;
  classSection: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  subjectId?: { _id: string; name?: string; code?: string } | string;
  teacherId?: { _id: string; name?: string } | string;
};

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StudentTimetablePage() {
  const { role, isLoaded } = useRoleGuard("student");
  const { user, status } = useAuth();
  const { request } = useApi();

  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const classSection = user?.classSection || "";

  const loadSlots = async () => {
    if (!classSection) return;
    try {
      setLoading(true);
      const payload = await request<{ data: TimetableSlot[] }>({
        method: "GET",
        url: `/timetable?classSection=${encodeURIComponent(classSection)}`
      });
      setSlots(payload?.data ?? []);
    } catch (error) {
      console.error("Failed to load timetable", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !role || status === "loading") return;
    void loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, role, status, classSection]);

  const todaySlots = useMemo(() => {
    const date = new Date(selectedDate);
    const dow = date.getDay();
    return slots.filter((slot) => slot.dayOfWeek === dow);
  }, [slots, selectedDate]);

  if (!isLoaded || !role || status === "loading") return null;

  return (
    <RoleLayout
      role="student"
      title="Timetable"
      subtitle="View your class schedule for the selected date."
    >
      <Card
        title="Timetable"
        subtitle={classSection ? `Class ${classSection}` : "Class section not set on your profile."}
      >
        <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm">
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
          <div className="flex gap-2 text-xs">
            <Button variant="outline" size="sm" onClick={loadSlots} disabled={loading || !classSection}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
        {!classSection ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Your class/section is not configured. Ask admin to set your classSection.
          </div>
        ) : loading && slots.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">Loading timetable...</div>
        ) : todaySlots.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No classes scheduled for {DAY_LABELS[new Date(selectedDate).getDay()]}
          </div>
        ) : (
          <div className="divide-y text-sm">
            {todaySlots.map((slot) => {
              const subjectLabel =
                typeof slot.subjectId === "string"
                  ? slot.subjectId
                  : slot.subjectId?.code || slot.subjectId?.name || "Subject";
              const teacherName =
                typeof slot.teacherId === "string" ? slot.teacherId : slot.teacherId?.name || "";
              const timeLabel = `${slot.startTime} - ${slot.endTime}`;
              return (
                <div key={slot._id} className="py-3">
                  <div className="font-semibold">{subjectLabel}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {timeLabel} {teacherName && `| ${teacherName}`}
                  </div>
                  {slot.room && (
                    <div className="text-xs text-muted-foreground mt-1">Room: {slot.room}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </RoleLayout>
  );
}



