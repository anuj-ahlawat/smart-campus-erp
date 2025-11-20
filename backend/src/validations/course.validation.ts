import { z } from "zod";

export const createCourseSchema = z.object({
  body: z.object({
    code: z.string(),
    title: z.string(),
    credits: z.number().int().nonnegative(),
    semester: z.number().int().positive(),
    academicYear: z.string()
  })
});
