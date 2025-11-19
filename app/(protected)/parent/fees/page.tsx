"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";

import type { UserRole } from "@/types/roles";

type ChildRecord = {
  _id: string;
  name: string;
  email: string;
  classSection?: string;
};

type FeeRecord = {
  _id: string;
  term: string;
  component: string;
  label?: string;
  amount: number;
  status: "not_paid" | "partial" | "paid";
  dueDate?: string;
  paidAmount?: number;
};

export default function ParentFeesPage() {
  const { role, isLoaded } = useRoleGuard("parent");
  const { user } = useAuth();
  const { request } = useApi();

  const [child, setChild] = useState<ChildRecord | null>(null);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !role || !user) return;
    const loadChildAndFees = async () => {
      try {
        const childPayload = await request<{ data: ChildRecord[] }>({
          method: "GET",
          url: `/users?role=student&parentEmail=${encodeURIComponent(user.email)}`
        });
        const childDoc = childPayload?.data?.[0];
        if (!childDoc) {
          setChild(null);
          setFees([]);
          setLoading(false);
          return;
        }
        setChild(childDoc);
        const feePayload = await request<{ data: FeeRecord[] }>({
          method: "GET",
          url: `/fees?studentId=${childDoc._id}`
        });
        setFees(feePayload?.data ?? []);
      } catch (error) {
        console.error("Failed to load fees for child", error);
      } finally {
        setLoading(false);
      }
    };
    void loadChildAndFees();
  }, [isLoaded, role, user, request]);

  const summary = useMemo(() => {
    const total = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
    const paid = fees.reduce((sum, f) => sum + (f.paidAmount || (f.status === "paid" ? f.amount : 0)), 0);
    const due = total - paid;
    return { total, paid, due };
  }, [fees]);

  if (!isLoaded || !role || !user) return null;

  return (
    <RoleLayout
      role="parent"
      title="Fees overview"
      subtitle="Check your child's fee components and payment status."
    >
      <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
        <Card>
          <div className="p-4 space-y-3 text-sm">
            <div className="font-medium text-xs mb-1">Child</div>
            {child ? (
              <div>
                <div className="text-sm font-semibold">{child.name}</div>
                <div className="text-xs text-muted-foreground">{child.email}</div>
                {child.classSection && (
                  <div className="text-xs text-muted-foreground mt-1">Class {child.classSection}</div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                No mapped child found. Ensure the student's parent email matches your login email.
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="text-base font-semibold">₹{summary.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Paid</p>
                <p className="text-base font-semibold text-success">₹{summary.paid.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Due</p>
                <p className="text-base font-semibold text-destructive">₹{summary.due.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Loading fees...</div>
          ) : !child ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No child mapped to this parent.</div>
          ) : fees.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No fee items recorded yet.</div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden text-xs md:text-sm">
              <div className="grid grid-cols-5 bg-muted px-3 py-2 font-medium text-muted-foreground">
                <div>TERM</div>
                <div>COMPONENT</div>
                <div>AMOUNT</div>
                <div>STATUS</div>
                <div className="text-right">DUE DATE</div>
              </div>
              <div className="divide-y">
                {fees.map((fee) => (
                  <div key={fee._id} className="grid grid-cols-5 items-center px-3 py-2 gap-2">
                    <div>{fee.term}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {fee.label || fee.component}
                    </div>
                    <div>₹{fee.amount.toFixed(2)}</div>
                    <div>
                      {fee.status === "paid"
                        ? "Paid"
                        : fee.status === "partial"
                        ? "Partially paid"
                        : "Not paid"}
                    </div>
                    <div className="text-right">
                      {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </RoleLayout>
  );
}
