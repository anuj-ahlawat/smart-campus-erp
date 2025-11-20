"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useAuthContext } from "@/providers/auth-provider";
import { useApi } from "@/hooks/useApi";

type AttendanceRecord = {
  _id: string;
  studentId: string;
  subjectId: string;
  classSection: string;
  classDate: string;
  status: "present" | "absent" | "leave";
};

type SubjectStat = {
  code: string;
  name: string;
  percentage: number;
  meta: string;
};

const semesters = [
  {
    id: "current",
    label: "Current semester",
    yearLabel: "Attendance % / Current"
  }
];

export default function StudentAttendancePage() {
  const { role, isLoaded } = useRoleGuard("student");
  const { user } = useAuthContext();
  const { request } = useApi();

  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(semesters[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<"subject" | "overall">("subject");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const payload = await request<{ data: AttendanceRecord[] }>({
          method: "GET",
          url: `/attendance/student/${encodeURIComponent(user.id)}`
        });
        setRecords(payload?.data ?? []);
      } catch (error) {
        console.error("Failed to load attendance", error);
      } finally {
        setLoading(false);
      }
    };
    if (isLoaded && role === "student") {
      void load();
    }
  }, [isLoaded, role, request, user?.id]);

  const subjectStats: SubjectStat[] = useMemo(() => {
    if (!records.length) return [];
    const bySubject: Record<string, { present: number; total: number }> = {};
    for (const record of records) {
      if (!bySubject[record.subjectId]) {
        bySubject[record.subjectId] = { present: 0, total: 0 };
      }
      bySubject[record.subjectId].total += 1;
      if (record.status === "present" || record.status === "leave") {
        bySubject[record.subjectId].present += 1;
      }
    }
    return Object.entries(bySubject).map(([subjectId, stats]) => {
      const percentage = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;
      const meta = `${subjectId} - ${percentage}% (${stats.present}/${stats.total})`;
      return {
        code: subjectId,
        name: subjectId,
        percentage,
        meta
      } satisfies SubjectStat;
    });
  }, [records]);

  const overall = useMemo(() => {
    if (!records.length) return undefined;
    let present = 0;
    let total = 0;
    for (const record of records) {
      total += 1;
      if (record.status === "present" || record.status === "leave") {
        present += 1;
      }
    }
    const percentage = total ? Math.round((present / total) * 100) : 0;
    return { percentage, present, total };
  }, [records]);

  const donutData: { name: string; value: number }[] = overall
    ? [
        { name: "Present", value: overall.percentage },
        { name: "Absent", value: 100 - overall.percentage }
      ]
    : [];

  if (!isLoaded || !role || !user) {
    return null;
  }

  return (
    <RoleLayout
      role="student"
      title="Attendance"
      subtitle="Track your subject-wise and overall attendance across semesters."
    >
      <Card
        title={semesters.find((s) => s.id === selectedSemesterId)?.yearLabel ?? "Attendance %"}
        subtitle="Subject-wise overview. Switch semesters to view previous records."
        actions={
          <select
            className="rounded-md border border-border bg-background px-3 py-1 text-xs"
            value={selectedSemesterId}
            onChange={(event) => setSelectedSemesterId(event.target.value)}
          >
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.label}
              </option>
            ))}
          </select>
        }
      >
        <div className="mb-4 flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-xs">
          <div>
            <div className="text-[11px] text-muted-foreground">Overall attendance (selected semester)</div>
            <div className="text-lg font-semibold">
              {(() => {
                if (!subjectStats.length) return "-";
                const total = subjectStats.reduce((sum, item) => sum + item.percentage, 0);
                const avg = Math.round(total / subjectStats.length);
                return `${avg}%`;
              })()}
            </div>
          </div>
          <div className="text-right">
            {(() => {
              if (!subjectStats.length) return null;
              const total = subjectStats.reduce((sum, item) => sum + item.percentage, 0);
              const avg = Math.round(total / subjectStats.length);
              const healthy = avg >= 75;
              return (
                <span
                  className={
                    healthy
                      ? "rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200"
                      : "rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700 border border-red-200"
                  }
                >
                  {healthy ? "Healthy" : "Short attendance"}
                </span>
              );
            })()}
          </div>
        </div>
        <div className="flex items-center gap-4 border-b border-border pb-2 text-xs mb-4">
          <button
            className={
              activeTab === "subject"
                ? "border-b-2 border-primary pb-1 font-medium"
                : "text-muted-foreground pb-1"
            }
            onClick={() => setActiveTab("subject")}
          >
            Subject-wise
          </button>
          <button
            className={
              activeTab === "overall"
                ? "border-b-2 border-primary pb-1 font-medium"
                : "text-muted-foreground pb-1"
            }
            onClick={() => setActiveTab("overall")}
          >
            Overall
          </button>
        </div>

        {activeTab === "subject" && (
          <div>
            <div className="h-72">
              {loading ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Loading attendance...
                </div>
              ) : !subjectStats.length ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No attendance records available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectStats} margin={{ left: -20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="code"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                      interval={0}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value: number, _name, payload) => [
                        `${value}%`,
                        (payload?.payload as { name?: string; meta?: string })?.name ?? "Attendance"
                      ]}
                      labelFormatter={(_label, payload) =>
                        (payload?.[0]?.payload as { meta?: string })?.meta ?? ""
                      }
                    />
                    <Bar dataKey="percentage" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {!loading && subjectStats.length > 0 && (
              <div className="mt-4 grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-2 md:grid-cols-3">
                {subjectStats.map((subject) => (
                  <div key={subject.code} className="flex items-center justify-between rounded border border-border/60 px-2 py-1">
                    <span className="font-medium text-foreground">{subject.code}</span>
                    <span>{subject.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "overall" && (
          <div className="flex flex-col items-start gap-8 py-6 md:flex-row md:items-center">
            <div className="h-56 w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius="70%"
                    outerRadius="100%"
                    data={donutData}
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-muted-foreground">
              {overall ? (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-foreground">
                    Overall percentage: <span className="font-bold">{overall.percentage}%</span>
                  </div>
                  <div>
                    No. of periods present: {overall.present}/{overall.total}
                  </div>
                </div>
              ) : (
                <div>No overall data available for this semester yet.</div>
              )}
            </div>
          </div>
        )}
      </Card>
    </RoleLayout>
  );
}

