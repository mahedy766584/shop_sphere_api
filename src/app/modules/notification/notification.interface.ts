/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Types } from 'mongoose';

export type TNotificationType = 'order' | 'promotion' | 'system' | 'message' | 'shipment';

export type TNotificationChannel = 'in_app' | 'push' | 'email' | 'sms';

export type TNotificationPriority = 'low' | 'normal' | 'high';

export type TNotification = {
  user: Types.ObjectId;
  type: TNotificationType;
  title?: string;
  message: string;
  channels: TNotificationChannel[];
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  locale: string;
  priority: TNotificationPriority;
  isDeleted: boolean;
  dedupeKey?: string;
  createdAt: Date;
  updatedAt: Date;
};
