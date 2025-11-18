"use client";

import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const rows = [
  { subject: "AI Theory", code: "AI301", marks: 92, grade: "A", fileUrl: "#" },
  { subject: "DSA", code: "CS202", marks: 88, grade: "A-", fileUrl: "#" }
];

export default function StudentResultsPage() {
  const { role, isLoaded } = useRoleGuard("student");
  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="student"
      title="Results Vault"
      subtitle="Data comes from GET /api/results/student/:studentId. CSV uploads originate at /teacher/results."
    >
      <Card title="Latest Grades" subtitle="Use Download to fetch signed file URLs.">
        <DataTable
          data={rows}
          columns={[
            { key: "subject", header: "Subject" },
            { key: "code", header: "Code" },
            { key: "marks", header: "Marks" },
            { key: "grade", header: "Grade" },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <Button size="sm" variant="outline" asChild>
                  <a href={row.fileUrl}>Download PDF</a>
                </Button>
              )
            }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}


