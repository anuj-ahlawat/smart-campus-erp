"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Scanner } from "@/components/qr/Scanner";
import { QRModal } from "@/components/qr/QRModal";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";

const todaySlots = [
  {
    type: "Breakfast",
    time: "07:30 AM - 09:30 AM",
    day: "Wednesday",
    items: [
      "Moongdal Chilla (250 Kcal)",
      "Green Chutney (90 Kcal)",
      "Boiled Egg (155 Kcal)",
      "Cornflakes (360 Kcal)",
      "Tea / Coffee / Milk"
    ]
  },
  {
    type: "Lunch",
    time: "12:00 PM - 03:00 PM",
    day: "Wednesday",
    items: [
      "Mix Veg (185 Kcal)",
      "Cabbage Matar (214 Kcal)",
      "Rajma (158 Kcal)",
      "Steamed Rice / Roti",
      "Masala Chaas (65 Kcal)"
    ]
  },
  {
    type: "Snack",
    time: "05:00 PM - 06:00 PM",
    day: "Wednesday",
    items: [
      "Pani Poori (307 Kcal)",
      "Sweet + Green Chutney",
      "Tea / Coffee"
    ]
  },
  {
    type: "Dinner",
    time: "08:00 PM - 10:00 PM",
    day: "Wednesday",
    items: [
      "Soya Chaap Masala (195 Kcal)",
      "Dal Tadka",
      "Jeera Rice / Roti",
      "Carrot Beetroot (80 Kcal)",
      "Sweet Dish"
    ]
  }
];

export default function StudentCafeteriaPage() {
  const { role, isLoaded } = useRoleGuard("student");
  const { request } = useApi();
  const [scannerOpen, setScannerOpen] = useState(false);

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="student"
      title="Cafeteria"
      subtitle="Menu sourced from GET /api/cafeteria/menu?date=YYYY-MM-DD. Scanner logs meals via POST /api/cafeteria/scan."
    >
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

      <Card title="Today's Menu" subtitle="19-Nov-2025 · Today · First Floor">
        <div className="divide-y">
          {todaySlots.map((slot) => (
            <div key={slot.type} className="flex flex-col gap-3 py-4 md:flex-row md:items-start md:gap-6">
              <div className="w-full md:w-1/4 text-sm text-muted-foreground">
                <div className="font-medium text-foreground">{slot.type}</div>
                <div className="text-xs mt-1">{slot.time}</div>
              </div>
              <div className="w-full md:flex-1 text-xs md:text-sm space-y-1">
                {slot.items.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
              <div className="flex w-full md:w-auto items-center justify-between md:flex-col md:items-end gap-2 text-xs">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                  {slot.day}
                </span>
                <Button size="sm" variant="outline" className="px-4">
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
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


