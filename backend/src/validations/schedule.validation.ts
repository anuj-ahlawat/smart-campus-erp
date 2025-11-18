import { z } from "zod";

const timetableBodySchema = z.object({
  classSection: z.string(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  subjectId: z.string(),
  teacherId: z.string(),
  room: z.string().optional()
});

export const timetableSchema = z.object({
  body: timetableBodySchema
});

const holidayBodySchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  description: z.string().optional(),
  category: z.enum(["college", "hostel", "canteen"])
});

export const holidayCreateSchema = z.object({
  body: holidayBodySchema
});

export const holidayUpdateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: holidayBodySchema.partial()
});

const eventBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  audience: z.array(z.string()),
  attachments: z.array(z.string()).optional()
});

export const eventSchema = z.object({
  body: eventBodySchema
});

export const eventUpdateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: eventBodySchema.partial()
});

