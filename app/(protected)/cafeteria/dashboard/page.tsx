"use client";

import { useEffect, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

type FeedbackRow = {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  studentId?: { name?: string; classSection?: string } | string;
};

export default function CafeteriaDashboardPage() {
  const { role, isLoaded } = useRoleGuard("cafeteria");
  const { request } = useApi();
  const [feedbacks, setFeedbacks] = useState<FeedbackRow[]>([]);

  useEffect(() => {
    if (!isLoaded || !role) return;
    const load = async () => {
      try {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10);
        const payload = await request<{ data: FeedbackRow[] }>({
          method: "GET",
          url: `/cafeteria/feedback?date=${dateStr}`
        });
        setFeedbacks(payload?.data ?? []);
      } catch (error) {
        console.error("Failed to load cafeteria feedback", error);
      }
    };
    void load();
  }, [isLoaded, role, request]);

  if (!isLoaded || !role) return null;

  const averageRating =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length
      : null;

  return (
    <RoleLayout role="cafeteria" title="Cafeteria Ops" subtitle="Today’s meals, menu, and feedback">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Meals served" subtitle="Today">
          <p className="text-3xl font-semibold">420</p>
        </Card>
        <Card title="Average rating" subtitle="Today’s student feedback">
          <p className="text-3xl font-semibold">
            {averageRating ? `${averageRating.toFixed(1)}/5` : "-"}
          </p>
        </Card>
        <Card title="Menu status" subtitle="Lunch">
          <p className="text-3xl font-semibold text-success">Published</p>
        </Card>
      </div>

      <Card
        className="mt-4"
        title="Today’s feedback"
        subtitle="Latest student reviews for today’s menu."
      >
        {feedbacks.length === 0 ? (
          <div className="py-4 text-xs text-muted-foreground">
            No feedback submitted yet for today.
          </div>
        ) : (
          <div className="space-y-2 text-xs md:text-sm max-h-64 overflow-y-auto pr-1">
            {feedbacks.map((fb) => (
              <div
                key={fb._id}
                className="rounded-md border border-border bg-card/60 px-3 py-2 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between text-[11px] md:text-xs">
                  <span className="font-medium">
                    {typeof fb.studentId === "string"
                      ? fb.studentId
                      : fb.studentId?.name || "Student"}
                    {typeof fb.studentId !== "string" && fb.studentId?.classSection
                      ? ` · ${fb.studentId.classSection}`
                      : ""}
                  </span>
                  <span className="text-yellow-500 font-semibold">{fb.rating}/5</span>
                </div>
                {fb.comment && (
                  <div className="text-[11px] md:text-xs text-muted-foreground whitespace-pre-wrap">
                    {fb.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </RoleLayout>
  );
}

