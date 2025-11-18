"use client";

import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const notes = [
  { title: "Week 4 Slides", subject: "AI Theory", url: "#" },
  { title: "Lab checklist", subject: "IoT", url: "#" }
];

export default function TeacherNotesPage() {
  const { role, isLoaded } = useRoleGuard("teacher");
  if (!isLoaded || !role) return null;
  return (
    <RoleLayout role="teacher" title="Notes Repository">
      <Card title="Uploaded Files">
        <DataTable
          data={notes}
          columns={[
            { key: "title", header: "Title" },
            { key: "subject", header: "Subject" },
            {
              key: "download",
              header: "Download",
              render: (row) => (
                <a href={row.url} className="text-primary underline">
                  Open
                </a>
              )
            }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}

