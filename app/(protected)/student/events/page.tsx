"use client";

import { useEffect, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

type EventRow = {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  audience?: string[];
};

export default function StudentEventsPage() {
  const { role, isLoaded } = useRoleGuard("student");
  const { request } = useApi();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !role) return;
    const load = async () => {
      try {
        setLoading(true);
        const payload = await request<{ data: EventRow[] }>({ method: "GET", url: "/events" });
        if (payload?.data) {
          setEvents(payload.data);
        }
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isLoaded, role, request]);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="student"
      title="Events & Activities"
      subtitle="Discover upcoming workshops, competitions and campus activities."
    >
      <Card title="Upcoming events" subtitle="Stay updated and plan your participation early.">
        {loading ? (
          <div className="py-4 text-center text-xs text-muted-foreground">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground">No upcoming events yet.</div>
        ) : (
          <div className="divide-y text-sm">
            {events.map((event) => (
              <div
                key={event._id}
                className="flex flex-col gap-2 py-3 md:flex-row md:items-start md:justify-between"
              >
                <div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.startDate).toLocaleString()}
                  </div>
                  <div className="font-semibold">{event.title}</div>
                  {event.description && (
                    <div className="text-xs text-muted-foreground mt-1 max-w-xl">
                      {event.description}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 text-xs mt-1 md:mt-0">
                  {event.audience && event.audience.length > 0 && (
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 border border-sky-200">
                      {event.audience.join(", ")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </RoleLayout>
  );
}

