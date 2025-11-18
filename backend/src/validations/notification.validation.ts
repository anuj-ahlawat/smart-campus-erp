import { z } from "zod";

export const sendNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    body: z.string().min(3),
    audience: z.array(z.string().email()),
    type: z.enum(["outpass", "attendance", "result"]).default("outpass")
  })
});

