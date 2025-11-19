"use client";

import { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const dayTimetable = [
  {
    time: "10:30 AM - 11:30 AM (60 min)",
    title: "Artificial Intelligence and Machine Learning (CSET301-P)",
    section: "P-LA-012",
    faculty: "Madhuri Gupta",
    room: "P-LA-012"
  },
  {
    time: "11:30 AM - 12:30 PM (60 min)",
    title: "Artificial Intelligence and Machine Learning (CSET301-P)",
    section: "P-LA-012",
    faculty: "Madhuri Gupta",
    room: "P-LA-012"
  },
  {
    time: "12:30 PM - 01:30 PM (60 min)",
    title: "Penetration Testing, Auditing and Ethical Hacking (CSET363)",
    section: "P-LH-103",
    faculty: "Ajay Kumar",
    room: "P-LH-103"
  },
  {
    time: "02:30 PM - 03:30 PM (60 min)",
    title: "Software Testing (CSET481)",
    section: "104-N-LH",
    faculty: "Aditya Upadhyay",
    room: "104-N-LH"
  },
  {
    time: "03:30 PM - 04:30 PM (60 min)",
    title: "Automata Theory and Computability (CSET302)",
    section: "104-N-LH",
    faculty: "Subodh Mishra",
    room: "104-N-LH"
  }
];

export default function StudentTimetablePage() {
  const { role, isLoaded } = useRoleGuard("student");
  const [selectedDate, setSelectedDate] = useState<string>("19-Nov-2025");

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role="student"
      title="Timetable"
      subtitle="View your class schedule for the selected date."
    >
      <Card title="Timetable" subtitle="Semester - 5 | 2025-2026">
        <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Button variant="outline" size="icon" className="h-7 w-7 text-xs">
              {"<"}
            </Button>
            <span className="text-xs font-medium">{selectedDate}</span>
            <Button variant="outline" size="icon" className="h-7 w-7 text-xs">
              {">"}
            </Button>
          </div>
          <div className="flex gap-2 text-xs">
            <Button variant="outline" size="sm">
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              Weekly schedule
            </Button>
          </div>
        </div>
        <div className="divide-y text-sm">
          {dayTimetable.map((slot) => (
            <div key={slot.time} className="py-3">
              <div className="font-semibold">{slot.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {slot.time} {slot.faculty && `| ${slot.faculty}`}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{slot.section}</div>
              <div className="text-xs text-muted-foreground mt-1">{slot.room}</div>
            </div>
          ))}
        </div>
      </Card>
    </RoleLayout>
  );
}



