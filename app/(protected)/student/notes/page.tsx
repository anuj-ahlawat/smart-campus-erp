"use client";

import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const notes = [
  { title: "Week 4 Slides", subject: "AI", url: "#" },
  { title: "IoT Lab Checklist", subject: "IoT", url: "#" }
];

export default function StudentNotesPage() {
  const { role, isLoaded } = useRoleGuard("student");
  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="student"
      title="Shared Notes"
      subtitle="Powered by GET /api/notes/subject/:subjectId after teachers upload via /teacher/notes."
    >
      <Card title="Downloads">
        <DataTable
          data={notes}
          columns={[
            { key: "title", header: "Title" },
            { key: "subject", header: "Subject" },
            {
              key: "download",
              header: "Download",
              render: (row) => (
                <Button size="sm" variant="outline" asChild>
                  <a href={row.url}>View</a>
                </Button>
              )
            }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}


