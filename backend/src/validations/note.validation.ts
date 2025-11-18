import { z } from "zod";

export const uploadNoteSchema = z.object({
  body: z.object({
    subjectId: z.string(),
    title: z.string()
  })
});

