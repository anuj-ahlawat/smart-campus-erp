"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/table";
import { FileUploader } from "@/components/forms/FileUploader";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useApi } from "@/hooks/useApi";
import type { UserRole } from "@/types/roles";

const students = [
  { id: "STD-01", name: "Aditi", present: true },
  { id: "STD-02", name: "Ravi", present: true },
  { id: "STD-03", name: "Maya", present: false }
];

export default function TeacherAttendancePage() {
  const searchParams = useSearchParams();
  const { role, isLoaded } = useRoleGuard(["teacher", "admin"]);
  const { request } = useApi();
  const [records, setRecords] = useState(students);
  const [noteStudent, setNoteStudent] = useState<(typeof students)[0] | null>(null);
  const [noteTitle, setNoteTitle] = useState("");

  const classId = searchParams.get("class") ?? "CSE-A";
  const subjectId = searchParams.get("subject") ?? "AI Theory";

  const saveAttendance = async () => {
    await request({
      method: "POST",
      url: "/attendance/mark",
      data: {
        classId,
        subjectId,
        date: new Date().toISOString(),
        present: records.filter((row) => row.present).map((row) => row.id)
      }
    });
  };

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "name", header: "Student" },
      {
        key: "present",
        header: "Present",
        render: (row: (typeof records)[0]) => (
          <input
            type="checkbox"
            checked={row.present}
            onChange={(event) =>
              setRecords((prev) =>
                prev.map((record) => (record.id === row.id ? { ...record, present: event.target.checked } : record))
              )
            }
          />
        )
      },
      {
        key: "note",
        header: "Note",
        render: (row: (typeof records)[0]) => (
          <Button size="sm" variant="outline" onClick={() => setNoteStudent(row)}>
            Add Note
          </Button>
        )
      }
    ],
    [records]
  );

  if (!isLoaded || !role) return null;

  return (
    <RoleLayout
      role={(role ?? "teacher") as UserRole}
      title={`Attendance • ${classId}`}
      subtitle="Save attendance triggers socket event attendanceMarked"
      actions={<Button onClick={saveAttendance}>Save Attendance</Button>}
    >
      <Card subtitle="Toggle presence, then save to POST /api/attendance/mark">
        <DataTable data={records} columns={columns as never} />
      </Card>
      <Modal
        title={`Add Note for ${noteStudent?.name ?? ""}`}
        description="POST /api/notes/upload"
        open={Boolean(noteStudent)}
        onOpenChange={(open) => !open && setNoteStudent(null)}
      >
        {noteStudent && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <input
                className="mt-1 w-full rounded-lg border border-border bg-transparent p-2 text-sm"
                value={noteTitle}
                onChange={(event) => setNoteTitle(event.target.value)}
              />
            </div>
            <FileUploader
              label="Attach PDF"
              accept=".pdf,.docx"
              onUpload={async (file) => {
                const formData = new FormData();
                formData.append("studentId", noteStudent.id);
                formData.append("file", file);
                await request({
                  method: "POST",
                  url: "/notes/upload",
                  data: formData,
                  headers: { "Content-Type": "multipart/form-data" }
                });
              }}
            />
            <Button
              onClick={() => {
                setNoteStudent(null);
                setNoteTitle("");
              }}
            >
              Send Note
            </Button>
          </div>
        )}
      </Modal>
    </RoleLayout>
  );
}

