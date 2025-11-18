import { z } from "zod";

export const markAttendanceSchema = z.object({
  body: z.object({
    classId: z.string(),
    subjectId: z.string(),
    date: z.coerce.date(),
    present: z.array(z.string())
  })
});

export const attendanceByStudentSchema = z.object({
  params: z.object({ studentId: z.string() }),
  query: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  })
});

