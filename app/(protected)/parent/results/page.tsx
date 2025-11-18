"use client";

import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const rows = [
  { subject: "AI Theory", grade: "A", published: "Aug 1" },
  { subject: "IoT Lab", grade: "B+", published: "Aug 2" }
];

export default function ParentResultsPage() {
  const { role, isLoaded } = useRoleGuard("parent");
  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="parent"
      title="Child results"
      subtitle="Results originate from POST /api/results/upload; parents hit GET /api/results/student/:studentId"
    >
      <Card>
        <DataTable
          data={rows}
          columns={[
            { key: "subject", header: "Subject" },
            { key: "grade", header: "Grade" },
            { key: "published", header: "Published" }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}


