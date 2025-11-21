"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Scanner } from "@/components/qr/Scanner";
import { QRModal } from "@/components/qr/QRModal";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

type MenuItem = {
  itemId: string;
  name: string;
  price?: number;
  available: boolean;
  mealType: MealType;
};

type CrowdStatus = "low" | "moderate" | "high";

type CrowdItem = {
  messId: string;
  crowdCount: number;
  status: CrowdStatus;
  updatedAt: string;
};

export default function StudentCafeteriaPage() {
  const { role, isLoaded } = useRoleGuard("student");
  const { request } = useApi();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [crowd, setCrowd] = useState<CrowdItem[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      try {
        const payload = await request<{ data: { items?: MenuItem[] } | null }>({
          method: "GET",
          url: `/cafeteria/menu?date=${dateStr}`
        });
        setMenuItems(payload?.data?.items ?? []);
      } catch (error) {
        console.error("Failed to load cafeteria menu", error);
      }
    };
    if (isLoaded && role) {
      void loadMenu();
    }
  }, [isLoaded, role, request]);

  useEffect(() => {
    if (!isLoaded || !role) return;

    let cancelled = false;

    const loadCrowd = async () => {
      try {
        const payload = await request<{ data: CrowdItem[] }>({
          method: "GET",
          url: "/cafeteria/crowd"
        });
        if (!cancelled) {
          setCrowd(payload?.data ?? []);
        }
      } catch (error) {
        // fail silently for UI; menu and scanning should still work
        if (!cancelled) {
          setCrowd([]);
        }
      }
    };

    void loadCrowd();
    const id = setInterval(loadCrowd, 20000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isLoaded, role, request]);

  const handleSubmitFeedback = async () => {
    if (!rating) return;
    setSubmittingFeedback(true);
    setFeedbackMessage(null);
    try {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      await request({
        method: "POST",
        url: "/cafeteria/feedback",
        data: {
          rating,
          comment: comment.trim() || undefined,
          date: dateStr
        }
      });
      setFeedbackMessage("Thank you for your feedback.");
    } catch (error) {
      console.error("Failed to submit cafeteria feedback", error);
      setFeedbackMessage("Could not submit feedback. Please try again later.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const grouped = useMemo(() => {
    const groups: Record<MealType, MenuItem[]> = {
      breakfast: [],
      lunch: [],
      snack: [],
      dinner: []
    };
    for (const item of menuItems) {
      if (groups[item.mealType]) {
        groups[item.mealType].push(item);
      }
    }
    return groups;
  }, [menuItems]);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="student"
      title="Cafeteria"
      subtitle="Menu"
    >
      <Card
        title="Mess crowd right now"
        subtitle="Based on plate QR scans in the last 20 minutes."
        className="mb-4"
      >
        {crowd.length === 0 ? (
          <div className="py-2 text-xs text-muted-foreground">
            Crowd data will appear here when students start scanning.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3 text-xs md:text-sm">
            {crowd.map((item) => {
              const label = item.messId || "Main mess";
              const updated = new Date(item.updatedAt).toLocaleTimeString();
              const colorClasses =
                item.status === "low"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : item.status === "moderate"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-red-50 text-red-700 border-red-200";
              const statusLabel =
                item.status === "low" ? "Low" : item.status === "moderate" ? "Moderate" : "High";
              return (
                <div
                  key={item.messId || "default"}
                  className={`rounded-xl border px-3 py-2 flex flex-col gap-1 ${colorClasses}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{label}</span>
                    <span className="text-[11px]">{statusLabel}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {item.crowdCount} scans in the last 20 minutes · updated {updated}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="mb-4 border-yellow-300 bg-yellow-50/70">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="text-lg">📷</span>
            <div>
              <div className="font-medium">Do you want to generate a reusable permanent QR code?</div>
              <div className="text-xs text-muted-foreground">
                Use the same QR daily for meal verification at the cafeteria.
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <QRModal value="CAFETERIA_REUSABLE_QR_DEMO" label="Show my reusable QR code" />
            <Button size="sm" variant="default">
              Regenerate my reusable QR code
            </Button>
            <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
              Scan staff QR
            </Button>
          </div>
        </div>
      </Card>
      <Card
        title="Rate today's food"
        subtitle="Share quick feedback with cafeteria staff for today's menu."
        className="mt-4"
      >
        <div className="space-y-3 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`h-7 w-7 rounded-full border text-xs flex items-center justify-center ${
                    rating === value ? "bg-primary text-primary-foreground" : "bg-background"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Comment (optional)</label>
            <textarea
              className="w-full rounded-md border border-border bg-background px-2 py-1 min-h-[60px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Lunch was tasty but rice was a bit hard."
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] text-muted-foreground">
              Your feedback is visible to cafeteria staff only.
            </div>
            <Button
              size="sm"
              onClick={handleSubmitFeedback}
              disabled={!rating || submittingFeedback}
            >
              {submittingFeedback ? "Submitting..." : "Submit feedback"}
            </Button>
          </div>
          {feedbackMessage && (
            <div className="text-[11px] text-muted-foreground">{feedbackMessage}</div>
          )}
        </div>
      </Card>

      <Card title="Today's Menu" subtitle="Today · Hostel Mess">
        {menuItems.length === 0 ? (
          <div className="py-4 text-xs text-muted-foreground">
            No menu published for today yet. Please check again later.
          </div>
        ) : (
          <div className="divide-y">
            {([
              ["Breakfast", "breakfast"] as const,
              ["Lunch", "lunch"] as const,
              ["Snack", "snack"] as const,
              ["Dinner", "dinner"] as const
            ]).map(([label, key]) => {
              const list = grouped[key];
              if (!list.length) return null;
              return (
                <div key={key} className="flex flex-col gap-3 py-4 md:flex-row md:items-start md:gap-6">
                  <div className="w-full md:w-1/4 text-sm text-muted-foreground">
                    <div className="font-medium text-foreground">{label}</div>
                  </div>
                  <div className="w-full md:flex-1 text-xs md:text-sm space-y-1">
                    {list.map((item) => (
                      <div key={item.itemId} className="flex justify-between gap-2">
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      <Modal
        title="Scan meal QR"
        description="QR payload is sent to POST /api/cafeteria/scan and logs in CafeteriaLog."
        open={scannerOpen}
        onOpenChange={setScannerOpen}
      >
        <Scanner
          onScan={async (payload) => {
            await request({
              method: "POST",
              url: "/cafeteria/scan",
              data: { payload }
            });
            setScannerOpen(false);
          }}
        />
      </Modal>
    </RoleLayout>
  );
}


