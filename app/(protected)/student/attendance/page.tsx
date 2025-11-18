"use client";

import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, Tooltip } from "recharts";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const chartData = [
  { week: "Week 1", attendance: 94 },
  { week: "Week 2", attendance: 96 },
  { week: "Week 3", attendance: 88 },
  { week: "Week 4", attendance: 92 }
];

const subjectRows = [
  { subject: "AI Theory", code: "AI301", percentage: "95%", status: "Healthy" },
  { subject: "DSA", code: "CS202", percentage: "90%", status: "Healthy" },
  { subject: "IoT Lab", code: "EE210", percentage: "84%", status: "Watch" }
];

export default function StudentAttendancePage() {
  const { role, isLoaded } = useRoleGuard("student");
  const [selectedSubject, setSelectedSubject] = useState<(typeof subjectRows)[0] | null>(null);

  if (!isLoaded || !role) {
    return null;
  }

  return (
    <RoleLayout
      role="student"
      title="Attendance Analytics"
      subtitle="Graph view + per subject breakdown. Button scenarios reflect real API workflows."
    >
      <Card title="Weekly Trend" subtitle="GET /api/attendance/student/:studentId?start=&end=">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <Tooltip />
              <Line type="monotone" dataKey="attendance" stroke="#0F62FE" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Per Subject" subtitle="Tap details → GET /api/attendance/class?subjectId=">
        <DataTable
          data={subjectRows}
          columns={[
            { key: "subject", header: "Subject" },
            { key: "code", header: "Code" },
            { key: "percentage", header: "Attendance" },
            { key: "status", header: "Status" },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <Button size="sm" variant="outline" onClick={() => setSelectedSubject(row)}>
                  View Details
                </Button>
              )
            }
          ]}
        />
      </Card>
      <Modal
        title={selectedSubject?.subject ?? "Subject details"}
        description="Pulls subject-level logs and remarks."
        open={Boolean(selectedSubject)}
        onOpenChange={(open) => !open && setSelectedSubject(null)}
      >
        {selectedSubject && (
          <div className="space-y-3 text-sm">
            <p>Code: {selectedSubject.code}</p>
            <p>Attendance: {selectedSubject.percentage}</p>
            <p>Status: {selectedSubject.status}</p>
            <p>Button “Request Correction” → POST /api/attendance/:id/correction</p>
          </div>
        )}
      </Modal>
    </RoleLayout>
  );
}

