"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";
import { SOCKET_EVENTS } from "@/src/lib/socket-events";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
};

export const NotificationBell = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useSocket(SOCKET_EVENTS.OUTPASS_STATUS_CHANGED, (payload: NotificationItem) => {
    setItems((prev) => [payload, ...prev].slice(0, 5));
    toast.success(payload.title);
  });

  useSocket(SOCKET_EVENTS.NEW_ANNOUNCEMENT, (payload: NotificationItem) => {
    setItems((prev) => [payload, ...prev].slice(0, 5));
    toast("New announcement broadcasted");
  });

  useEffect(() => {
    // load initial in-app notifications from API
  }, []);

  return (
    <div className="relative">
      <Button variant="outline" size="icon">
        <Bell className="h-4 w-4" />
      </Button>
      {items.length > 0 && (
        <div className="absolute right-0 mt-3 w-64 rounded-xl border border-border bg-card p-3 shadow-lg">
          <p className="mb-2 text-sm font-semibold">Notifications</p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {items.map((item) => (
              <li key={item.id}>
                <span className="font-medium text-foreground">{item.title}</span>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

