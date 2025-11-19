import { z } from "zod";

export const feeBodySchema = z.object({
  studentId: z.string(),
  term: z.string(),
  component: z.enum(["tuition", "hostel", "transport", "exam", "library", "other"]),
  label: z.string().optional(),
  amount: z.number().nonnegative(),
  dueDate: z.coerce.date().optional(),
  status: z.enum(["not_paid", "partial", "paid"]).default("not_paid"),
  paidAmount: z.number().nonnegative().optional(),
  paidDate: z.coerce.date().optional(),
  notes: z.string().optional()
});

export const createFeeSchema = z.object({
  body: z.union([feeBodySchema, z.array(feeBodySchema)])
});

export const updateFeeSchema = z.object({
  params: z.object({ id: z.string() }),
  body: feeBodySchema.partial()
});
