import { z } from "zod";

export const submitFeedbackSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().max(500).optional(),
    date: z.string().optional() // YYYY-MM-DD
  })
});

export const listFeedbackSchema = z.object({
  query: z.object({
    date: z.string().optional()
  })
});
