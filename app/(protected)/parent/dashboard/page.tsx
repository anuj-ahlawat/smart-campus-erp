"use client";

import { useEffect, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { StudentProfileCard } from "@/components/student/StudentProfileCard";

type ChildRecord = {
  _id: string;
  name: string;
  email: string;
  classSection?: string;
  department?: string;
  admissionNo?: string;
  semester?: string;
  course?: string;
  hostelStatus?: boolean;
  roomNumber?: string;
};

type OutpassRow = {
  id: string;
  student: string;
  reason: string;
};

export default function ParentDashboardPage() {
  const { role, isLoaded } = useRoleGuard("parent");
  const { user } = useAuth();
  const { request } = useApi();
  const [child, setChild] = useState<ChildRecord | null>(null);
  const [records, setRecords] = useState<OutpassRow[]>([]);

  useEffect(() => {
    if (!isLoaded || !role || !user) return;
    const loadChild = async () => {
      try {
        const payload = await request<{ data: ChildRecord[] }>({
          method: "GET",
          url: `/users?role=student&parentEmail=${encodeURIComponent(user.email)}`
        });
        if (payload?.data && payload.data.length > 0) {
          setChild(payload.data[0]);
        }
      } catch (error) {
        console.error("Failed to load child for parent", error);
      }
    };
    void loadChild();
  }, [isLoaded, role, user, request]);

  useEffect(() => {
    if (!child) return;
    const loadOutpasses = async () => {
      try {
        const payload = await request<{ data: any[] }>({
          method: "GET",
          url: `/outpass/student/${child._id}`
        });
        const rows: OutpassRow[] = (payload?.data || [])
          .filter((item) => item.parentApproval === "pending")
          .map((item) => ({
            id: item._id,
            student: child.name,
            reason: item.reason ?? "-"
          }));
        setRecords(rows);
      } catch (error) {
        console.error("Failed to load pending outpasses for parent", error);
      }
    };
    void loadOutpasses();
  }, [child, request]);

  if (!isLoaded || !role || !user) return null;

  return (
    <RoleLayout
      role="parent"
      title="Parent Overview"
      subtitle="See your child's profile and approve outpasses."
    >
      <Card title="Child Snapshot">
        {child ? (
          <StudentProfileCard
            profile={{
              name: child.name,
              email: child.email,
              admissionNo: child.admissionNo,
              semester: child.semester,
              course: child.course,
              department: child.department,
              classSection: child.classSection,
              hostelStatus: child.hostelStatus,
              roomNumber: child.roomNumber
            }}
          />
        ) : (
          <div className="py-4 text-xs text-muted-foreground">
            No mapped child found. Ensure the student's parent email matches your login email.
          </div>
        )}
      </Card>
      <Card title="Pending Outpasses" subtitle="Approve → notify student + warden">
        <DataTable
          data={records}
          columns={[
            { key: "id", header: "Ticket" },
            { key: "student", header: "Student" },
            { key: "reason", header: "Reason" },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await request({
                        method: "PUT",
                        url: `/outpass/${row.id}/parent-approve`,
                        data: { decision: "approved" }
                      });
                      setRecords((prev) => prev.filter((record) => record.id !== row.id));
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await request({
                        method: "PUT",
                        url: `/outpass/${row.id}/parent-approve`,
                        data: { decision: "rejected" }
                      });
                      setRecords((prev) => prev.filter((record) => record.id !== row.id));
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )
            }
          ]}
        />
      </Card>
    </RoleLayout>
  );
}

