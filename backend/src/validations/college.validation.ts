import { z } from "zod";

export const updateCollegeSettingsSchema = z.object({
  body: z.object({
    academicYear: z.string().min(4),
    slotsPerDay: z.number().int().min(1).max(12).optional(),
    weekDays: z.array(z.number().int().min(0).max(6)).optional(),
    totalRooms: z.number().int().min(0).optional(),
    curfewTime: z.string().optional(),
    timetableConfig: z
      .object({
        slotsPerDay: z.number().int().min(1).max(12),
        weekDays: z.array(z.number().int().min(0).max(6))
      })
      .optional(),
    hostelConfig: z
      .object({
        totalRooms: z.number().int().min(0),
        curfewTime: z.string()
      })
      .optional()
  })
});


