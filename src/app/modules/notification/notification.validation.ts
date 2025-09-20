import { z } from 'zod';

import {
  NotificationChannel,
  NotificationPriority,
  NotificationType,
} from './notification.constant.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z
  .string()
  .regex(objectIdRegex, 'Invalid ObjectId format (must be 24 hex characters)');

const MetadataSchema = z
  .record(z.string(), z.unknown())
  .optional()
  .describe('Flexible metadata object with string keys and any values');

const CreateNotificationSchema = z.object({
  body: z.object({
    type: z.enum(NotificationType, {
      message: 'Type must be one of: order, promotion, system, message, shipment',
    }),
    title: z
      .string()
      .min(1, 'Title must have at least 1 character')
      .max(250, 'Title cannot exceed 250 characters')
      .optional(),
    message: z
      .string()
      .min(3, 'Message is too short (min 3 characters)')
      .max(2000, 'Message is too long (max 2000 characters)'),
    channels: z
      .array(z.enum(NotificationChannel))
      .nonempty('At least one channel is required')
      .default(['in_app'])
      .transform((arr) => Array.from(new Set(arr))),
    metadata: MetadataSchema,
    locale: z
      .string()
      .min(2, 'Locale code too short')
      .max(10, 'Locale code too long')
      .default('en'),
    priority: z
      .enum(NotificationPriority)
      .default('normal')
      .describe('Priority can be low, normal, or high'),
    dedupeKey: z.string().max(512, 'Dedupe key too long').optional(),
    isRead: z.boolean().default(false).optional(),
  }),
});

const UpdateNotificationSchema = z.object({
  body: z.object({
    notificationId: objectId,
    title: z
      .string()
      .min(1, 'Title must have at least 1 character')
      .max(250, 'Title cannot exceed 250 characters')
      .optional(),
    message: z
      .string()
      .min(3, 'Message is too short (min 3 characters)')
      .max(2000, 'Message is too long (max 2000 characters)')
      .optional(),
    channels: z
      .array(z.enum(NotificationChannel))
      .nonempty('At least one channel is required')
      .optional()
      .transform((arr) => (arr ? Array.from(new Set(arr)) : arr)),
    metadata: MetadataSchema,
    locale: z.string().min(2, 'Locale code too short').max(10, 'Locale code too long').optional(),
    priority: z.enum(NotificationPriority).optional(),
    isRead: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

const MarkAsReadSchema = z.object({
  body: z.object({
    notificationId: objectId,
    userId: objectId,
  }),
});

export const NotificationValidation = {
  CreateNotificationSchema,
  UpdateNotificationSchema,
  MarkAsReadSchema,
};
