"use client";

import { useParams } from "next/navigation";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRModal } from "@/components/qr/QRModal";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { generateQRPayload } from "@/src/lib/generateQRPayload";

export default function OutpassDetailsPage() {
  const params = useParams();
  const { role, isLoaded } = useRoleGuard("student");
  const ticketId = params?.id as string;
  const isApproved = true;

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout role="student" title={`Outpass ${ticketId}`} subtitle="This screen is used after submitting from dashboard modal.">
      <Card title="Workflow" subtitle="Parent ➝ Warden ➝ Admin Override ➝ Security">
        <div className="space-y-3 text-sm">
          <p>Status: {isApproved ? "Approved" : "Pending"}</p>
          <p>Reason: Family event</p>
          <p>Dates: 12 Aug 2025 → 13 Aug 2025</p>
          <div className="flex gap-3">
            <Button variant="outline">Download PDF</Button>
            {isApproved && <QRModal value={generateQRPayload(ticketId, "signed-token")} />}
          </div>
        </div>
      </Card>
    </RoleLayout>
  );
}

