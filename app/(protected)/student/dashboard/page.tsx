"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Scanner } from "@/components/qr/Scanner";
import { useApi } from "@/hooks/useApi";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const cards = [
  { title: "Attendance", value: "92%", description: "This semester average" },
  { title: "Next Class", value: "AI Lab • 2:30 PM", description: "Room B-302" },
  { title: "Outpass Status", value: "Pending", description: "Hostel leave #OPS-231" },
  { title: "Cafeteria Today", value: "Paneer Bowl", description: "Token slots 12-3pm" }
];

export default function StudentDashboardPage() {
  const router = useRouter();
  const { role, isLoaded } = useRoleGuard("student");
  const { request } = useApi();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [type, setType] = useState<"day" | "leave">("day");
  const [travelDates, setTravelDates] = useState({ from: "", to: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoaded || !role) {
    return <div className="p-8 text-center">Preparing dashboard…</div>;
  }

  const handleOutpassApply = async () => {
    setIsSubmitting(true);
    const payload = await request<{ data: { _id: string; qrCodeUrl: string } }>({
      method: "POST",
      url: "/outpass/apply",
      data: {
        reason,
        type,
        fromDate: travelDates.from,
        toDate: travelDates.to
      }
    });
    setIsSubmitting(false);
    setApplyModalOpen(false);
    if (payload?.data?._id) {
      router.push(`/student/outpass/${payload.data._id}`);
    }
  };

  const handleMealScan = async (qr: string) => {
    await request({
      method: "POST",
      url: "/cafeteria/scan",
      data: { payload: qr }
    });
    setScanModalOpen(false);
  };

  return (
    <RoleLayout role="student" title="Student Control Center" subtitle="Track academics, passes, hostel & cafeteria">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} title={card.title} subtitle={card.description}>
            <p className="text-2xl font-semibold">{card.value}</p>
          </Card>
        ))}
      </div>
      <Card
        title="Shortcuts"
        subtitle="Complete top flows in two clicks"
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => router.push("/student/attendance")}>
              View Attendance
            </Button>
            <Button size="sm" variant="outline" onClick={() => setApplyModalOpen(true)}>
              Apply Outpass
            </Button>
            <Button size="sm" variant="outline" onClick={() => setScanModalOpen(true)}>
              Scan Meal QR
            </Button>
          </div>
        }
      >
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Apply Outpass → POST /api/outpass/apply → redirect /student/outpass/:id</li>
          <li>• View Attendance → GET /api/attendance/student/:studentId</li>
          <li>• Scan Meal QR → POST /api/cafeteria/scan → toast success + refresh</li>
        </ul>
      </Card>

      <Modal
        title="Apply for Outpass"
        description="Requests notify parents → warden → admin override if needed."
        open={applyModalOpen}
        onOpenChange={setApplyModalOpen}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Reason</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-border bg-transparent p-2 text-sm"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                className="mt-1 w-full rounded-lg border border-border bg-transparent p-2 text-sm"
                value={type}
                onChange={(event) => setType(event.target.value as "day" | "leave")}
              >
                <option value="day">Day Pass</option>
                <option value="leave">Leave</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">From</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-border bg-transparent p-2 text-sm"
                value={travelDates.from}
                onChange={(event) => setTravelDates((prev) => ({ ...prev, from: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">To</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-border bg-transparent p-2 text-sm"
                value={travelDates.to}
                onChange={(event) => setTravelDates((prev) => ({ ...prev, to: event.target.value }))}
              />
            </div>
          </div>
          <Button className="w-full" disabled={isSubmitting} onClick={handleOutpassApply}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </Modal>

      <Modal
        title="Scan Cafeteria QR"
        description="Students scan to log meals. POST /api/cafeteria/scan runs with payload."
        open={scanModalOpen}
        onOpenChange={setScanModalOpen}
      >
        <Scanner
          onScan={async (value) => {
            await handleMealScan(value);
          }}
        />
      </Modal>
    </RoleLayout>
  );
}

