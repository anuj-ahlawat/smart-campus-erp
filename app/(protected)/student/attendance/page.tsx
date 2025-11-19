"use client";

import { useState } from "react";
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

const semesters = [
  {
    id: "2025-26-sem5",
    label: "2025-2026, Semester - 5, B.Tech (CSE)",
    yearLabel: "Attendance % / 2025-2026"
  },
  {
    id: "2024-25-sem4",
    label: "2024-2025, Semester - 4, B.Tech (CSE)",
    yearLabel: "Attendance % / 2024-2025"
  }
];

const subjectAttendanceBySemester: Record<
  string,
  { code: string; name: string; percentage: number; meta: string }[]
> = {
  "2025-26-sem5": [
    { code: "CSET301", name: "AI & ML", percentage: 88, meta: "CSET301 - 88% (17/19)" },
    { code: "CSET302", name: "Automata Theory", percentage: 92, meta: "CSET302 - 92% (24/26)" },
    { code: "CSET303", name: "Penetration Testing", percentage: 79, meta: "CSET303 - 79% (22/28)" },
    { code: "CSET304", name: "Software Testing", percentage: 85, meta: "CSET304 - 85% (18/21)" },
    { code: "CSET305", name: "Ethical Hacking", percentage: 91, meta: "CSET305 - 91% (20/22)" }
  ],
  "2024-25-sem4": [
    { code: "CSET210", name: "Design Thinking", percentage: 93, meta: "CSET210 - 93% (26/28)" },
    { code: "CSET227", name: "Network Security", percentage: 87, meta: "CSET227 - 87% (21/24)" },
    { code: "CSET209", name: "Operating Systems", percentage: 90, meta: "CSET209 - 90% (27/30)" },
    { code: "CSET207", name: "Computer Networks", percentage: 82, meta: "CSET207 - 82% (23/28)" }
  ]
};

const overallAttendanceBySemester: Record<
  string,
  { percentage: number; present: number; total: number }
> = {
  "2025-26-sem5": { percentage: 88, present: 274, total: 311 },
  "2024-25-sem4": { percentage: 92, present: 260, total: 283 }
};

export default function StudentAttendancePage() {
  const { role, isLoaded } = useRoleGuard("student");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(semesters[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<"subject" | "overall">("subject");

  if (!isLoaded || !role) {
    return null;
  }

  const overall = overallAttendanceBySemester[selectedSemesterId];
  const donutData: { name: string; value: number }[] = overall
    ? [
        { name: "Present", value: overall.percentage },
        { name: "Absent", value: 100 - overall.percentage }
      ]
    : [];

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
                const data = subjectAttendanceBySemester[selectedSemesterId] ?? [];
                if (!data.length) return "-";
                const total = data.reduce((sum, item) => sum + item.percentage, 0);
                const avg = Math.round(total / data.length);
                return `${avg}%`;
              })()}
            </div>
          </div>
          <div className="text-right">
            {(() => {
              const data = subjectAttendanceBySemester[selectedSemesterId] ?? [];
              if (!data.length) return null;
              const total = data.reduce((sum, item) => sum + item.percentage, 0);
              const avg = Math.round(total / data.length);
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
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectAttendanceBySemester[selectedSemesterId] ?? []}
                margin={{ left: -20, right: 10 }}
              >
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

