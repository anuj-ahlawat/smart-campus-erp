"use client";

import { useEffect, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/table";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

type EventRecord = {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  audience?: string[];
};

const emptyEvent = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  audience: "students"
};

export default function AdminEventsPage() {
  const { role, isLoaded } = useRoleGuard("admin");
  const { request } = useApi();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventRecord | null>(null);
  const [form, setForm] = useState({ ...emptyEvent });

  const loadEvents = async () => {
    try {
      setLoading(true);
      const payload = await request<{ data: EventRecord[] }>({ method: "GET", url: "/events" });
      if (payload?.data) {
        setEvents(payload.data);
      }
    } catch (error) {
      console.error("Failed to load events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !role) return;
    void loadEvents();
  }, [isLoaded, role]);

  const handleSave = async () => {
    if (!form.title || !form.startDate || !form.endDate) return;
    const body = {
      title: form.title,
      description: form.description || undefined,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      audience: form.audience ? form.audience.split(",").map((v) => v.trim()).filter(Boolean) : ["students"]
    };

    if (editing) {
      await request({ method: "PUT", url: `/events/${editing._id}`, data: body });
    } else {
      await request({ method: "POST", url: "/events", data: body });
    }

    setModalOpen(false);
    setEditing(null);
    setForm({ ...emptyEvent });
    void loadEvents();
  };

  const columns = [
    { key: "title", header: "Title" },
    {
      key: "dates",
      header: "When",
      render: (row: EventRecord) => {
        const start = new Date(row.startDate).toLocaleString();
        const end = new Date(row.endDate).toLocaleString();
        return (
          <div className="text-xs">
            <div>{start}</div>
            <div className="text-muted-foreground">to {end}</div>
          </div>
        );
      }
    },
    {
      key: "audience",
      header: "Audience",
      render: (row: EventRecord) => (row.audience || []).join(", ")
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: EventRecord) => (
        <div className="flex gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditing(row);
              setForm({
                title: row.title,
                description: row.description || "",
                startDate: row.startDate.slice(0, 16),
                endDate: row.endDate.slice(0, 16),
                audience: (row.audience || []).join(", ") || "students"
              });
              setModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={async () => {
              await request({ method: "DELETE", url: `/events/${row._id}` });
              void loadEvents();
            }}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="admin"
      title="Events Management"
      subtitle="Create and manage campus events, workshops and club activities."
      actions={
        <Button
          variant="outline"
          onClick={() => {
            setEditing(null);
            setForm({ ...emptyEvent });
            setModalOpen(true);
          }}
        >
          Add event
        </Button>
      }
    >
      <Card>
        {loading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Loading events...</div>
        ) : (
          <DataTable data={events} columns={columns as never} />
        )}
      </Card>

      <Modal
        title={editing ? "Edit event" : "Add event"}
        description="Provide full details so students know what the event is about."
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setModalOpen(false);
            setEditing(null);
          }
        }}
      >
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Title</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Audience (comma separated)</label>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={form.audience}
                onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Start date & time</label>
              <input
                type="datetime-local"
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">End date & time</label>
              <input
                type="datetime-local"
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Why / full description</label>
            <textarea
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs min-h-[80px]"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save event
            </Button>
          </div>
        </div>
      </Modal>
    </RoleLayout>
  );
}
