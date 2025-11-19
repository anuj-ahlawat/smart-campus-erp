"use client";

import { useEffect, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/hooks/useAuth";

type HostelStudent = {
  _id: string;
  name: string;
  email?: string;
  department?: string;
  classSection?: string;
  roomNumber?: string;
  phone?: string;
  admissionNo?: string;
  address?: string;
  hostelStatus?: boolean;
};

export default function WardenStudentsPage() {
  const { role, isLoaded } = useRoleGuard("warden");
  const { request } = useApi();
  const { user } = useAuth();
  const [students, setStudents] = useState<HostelStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HostelStudent | null>(null);

  useEffect(() => {
    if (!isLoaded || !role) return;
    const load = async () => {
      try {
        const payload = await request<{ data: HostelStudent[] }>({
          method: "GET",
          url: "/users?role=student&hostelStatus=true"
        });
        if (payload?.data) {
          setStudents(payload.data);
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isLoaded, role, request]);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="warden"
      title="Hostel Roster"
      subtitle="List of hosteller students with their room numbers."
    >
      <Card>
        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading hostel students…</div>
        ) : (
          <DataTable
            data={students}
            columns={[
              { key: "name", header: "Student" },
              { key: "email", header: "Email" },
              { key: "department", header: "Department" },
              { key: "classSection", header: "Class / Section" },
              { key: "roomNumber", header: "Room" },
              {
                key: "actions",
                header: "Details",
                render: (row: HostelStudent) => (
                  <button
                    className="text-xs rounded-md border border-border px-2 py-1 hover:bg-muted"
                    onClick={() => setSelected(row)}
                  >
                    View
                  </button>
                )
              }
            ]}
          />
        )}
      </Card>

      <Modal
        title="Student details"
        description="Additional hostel and contact information for this student."
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        {selected && (
          <div className="space-y-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Name</div>
              <div className="font-medium">{selected.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="text-xs">{selected.email || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Phone</div>
                <div className="text-xs">{selected.phone || "-"}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Department</div>
                <div className="text-xs">{selected.department || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Class / Section</div>
                <div className="text-xs">{selected.classSection || "-"}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Admission number</div>
                <div className="text-xs">{selected.admissionNo || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Hostel / Room</div>
                <div className="text-xs">
                  {selected.hostelStatus ? `Hosteller — ${selected.roomNumber || "No room set"}` : "Dayscholar"}
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Address</div>
              <div className="text-xs whitespace-pre-wrap">{selected.address || "-"}</div>
            </div>
            <div className="pt-2 border-t border-border mt-2 text-xs text-muted-foreground">
              For escalations, contact your college admin office
              {user?.collegeName ? ` at ${user.collegeName}` : ""}.
            </div>
          </div>
        )}
      </Modal>
    </RoleLayout>
  );
}


