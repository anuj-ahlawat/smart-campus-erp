import { z } from "zod";

const baseUserFields = {
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["admin", "student", "teacher", "parent", "warden", "staff", "cafeteria", "security"]),
  department: z.string().optional(),
  classSection: z.string().optional(),
  hostelStatus: z.boolean().optional(),
  roomNumber: z.string().optional(),
  parentId: z.string().optional(),
  parentEmail: z.string().email().optional(),
  teachingSubjects: z.array(z.string()).max(3).optional()
};

export const createUserSchema = z.object({
  body: z.object({
    ...baseUserFields,
    password: z.string().min(8)
  })
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z
    .object({
      ...baseUserFields,
      password: z.string().min(8).optional(),
      status: z.enum(["active", "inactive"]).optional()
    })
    .partial()
});

export const updateUserRoleSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    role: baseUserFields.role
  })
});

