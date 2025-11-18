import { z } from "zod";

const emailSchema = z.string().email();

export const collegeRegisterSchema = z.object({
  body: z.object({
    collegeName: z.string().min(3),
    adminName: z.string().min(3),
    adminEmail: emailSchema,
    password: z.string().min(8),
    phone: z.string().min(6),
    instituteCode: z.string().optional().transform((val) => (val && val.trim() ? val.trim() : undefined)),
    academicYear: z.string().min(4).default("2024-2025")
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1)
  })
});

export const inviteCreateSchema = z.object({
  body: z.object({
    role: z.enum(["student", "teacher", "parent", "warden", "staff", "cafeteria", "security"]),
    department: z.string().optional(),
    classSection: z.string().optional(),
    hostelStatus: z.boolean().optional(),
    roomNumber: z.string().optional(),
    validUntil: z.string().datetime().optional(),
    bulkCsv: z.string().optional()
  })
});

export const inviteValidateSchema = z.object({
  query: z.object({
    code: z.string().min(6)
  })
});

export const inviteRegisterSchema = z.object({
  body: z.object({
    code: z.string().min(6),
    name: z.string().min(3),
    email: emailSchema,
    phone: z.string().min(6),
    password: z.string().min(8)
  })
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(1)
  })
});

export const passwordResetRequestSchema = z.object({
  body: z.object({
    email: emailSchema
  })
});

export const passwordResetSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8)
  })
});


