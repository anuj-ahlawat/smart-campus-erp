"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FileUploader } from "@/components/forms/FileUploader";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import type { UserRole } from "@/types/roles";

const submissions = [
  { id: "RES-01", subject: "AI", count: 60, published: true },
  { id: "RES-02", subject: "IoT", count: 60, published: false }
];

export default function TeacherResultsPage() {
  const { role, isLoaded } = useRoleGuard(["teacher", "admin"]);
  const { request } = useApi();
  const [modalOpen, setModalOpen] = useState(false);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role={(role ?? "teacher") as UserRole}
      title="Results Uploads"
      subtitle="Single row or CSV bulk uploads hit POST /api/results/upload."
      actions={
        <Button onClick={() => setModalOpen(true)}>
          Upload Results
        </Button>
      }
    >
      <Card>
        <DataTable
          data={submissions}
          columns={[
            { key: "id", header: "Batch" },
            { key: "subject", header: "Subject" },
            { key: "count", header: "Records" },
            {
              key: "published",
              header: "Published",
              render: (row) => (row.published ? "Yes" : "Draft")
            }
          ]}
        />
      </Card>
      <Modal
        title="Upload CSV or single result"
        description="Send JSON payloads or CSV attachments. When published=true a socket + email notification triggers."
        open={modalOpen}
        onOpenChange={setModalOpen}
      >
        <FileUploader
          accept=".csv,.json"
          label="CSV or JSON"
          onUpload={async (file) => {
            const body = new FormData();
            body.append("file", file);
            await request({
              method: "POST",
              url: "/results/upload",
              data: body,
              headers: { "Content-Type": "multipart/form-data" }
            });
            setModalOpen(false);
          }}
        />
      </Modal>
    </RoleLayout>
  );
}


