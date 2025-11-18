"use client";

import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const rooms = [
  { room: "H-201", capacity: 3, occupants: ["Nisha", "Ria", "Saanvi"] },
  { room: "H-202", capacity: 2, occupants: ["Raghav"] }
];

export default function WardenStudentsPage() {
  const { role, isLoaded } = useRoleGuard("warden");
  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="warden"
      title="Hostel roster"
      subtitle="Powered by HostelRoom collection. Endpoint: GET /api/hostel/rooms (extend as needed)."
    >
      <Card>
        <DataTable
          data={rooms}
          columns={[
            { key: "room", header: "Room" },
            { key: "capacity", header: "Capacity" },
            {
              key: "occupants",
              header: "Occupants",
              render: (row) => row.occupants.join(", ")
            }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}


