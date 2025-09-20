import { Types } from 'mongoose';
import { z } from 'zod';

const getAuditLogsQuerySchema = z.object({
  body: z.object({
    resourceType: z.string().optional(),
    resourceId: z
      .string()
      .refine((v) => !v || Types.ObjectId.isValid(v), { message: 'Invalid resourceId' })
      .optional(),
    action: z.enum(['create', 'update', 'delete', 'custom']).optional(),
    performedBy: z
      .string()
      .refine((v) => !v || Types.ObjectId.isValid(v), { message: 'Invalid performedBy' })
      .optional(),
    dateFrom: z
      .string()
      .optional()
      .transform((s) => (s ? new Date(s) : undefined)),
    dateTo: z
      .string()
      .optional()
      .transform((s) => (s ? new Date(s) : undefined)),
    limit: z.coerce
      .number()
      .optional()
      .default(50)
      .refine((n) => n > 0 && n <= 200),
    page: z.coerce
      .number()
      .optional()
      .default(1)
      .refine((n) => n > 0),
  }),
});

export const AuditLogValidation = {
  getAuditLogsQuerySchema,
};
