import { z } from "zod";

export const applyOutpassSchema = z.object({
  body: z.object({
    reason: z.string().min(3),
    type: z.enum(["day", "leave"]),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date()
  })
});

export const approveOutpassSchema = z.object({
  params: z.object({ id: z.string().min(3) }),
  body: z.object({
    decision: z.enum(["approved", "rejected", "needs-info"]).default("approved")
  })
});

export const adminOverrideSchema = z.object({
  params: z.object({ id: z.string().min(3) }),
  body: z.object({
    status: z.enum(["approved", "rejected"])
  })
});

