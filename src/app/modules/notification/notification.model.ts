// models/notification.model.ts
import { Schema, model } from 'mongoose';

import type { TNotification } from './notification.interface.js';

export type TNotificationType = 'order' | 'promotion' | 'system' | 'message' | 'shipment';
export type TNotificationChannel = 'in_app' | 'push' | 'email' | 'sms';

const notificationSchema = new Schema<TNotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: {
        values: ['order', 'promotion', 'system', 'message', 'shipment'],
        message: 'Type must be one of: order, promotion, system, message, shipment',
      },
      required: [true, 'Notification type is required'],
    },
    title: { type: String },
    message: {
      type: String,
      required: [true, 'Message is required'],
      minlength: [3, 'Message too short'],
    },
    channels: {
      type: [{ type: String, enum: ['in_app', 'push', 'email', 'sms'] }],
      default: ['in_app'],
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
    locale: { type: String, default: 'en' },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    isDeleted: { type: Boolean, default: false },
    dedupeKey: { type: String, index: true },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ dedupeKey: 1 }, { unique: false });
export const Notification = model('Notification', notificationSchema);
