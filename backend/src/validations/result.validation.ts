import { z } from "zod";

export const uploadResultSchema = z.object({
  body: z.object({
    studentId: z.string(),
    subjectId: z.string(),
    marks: z.number(),
    grade: z.string(),
    fileUrl: z.string().optional(),
    published: z.boolean().default(false)
  })
});

