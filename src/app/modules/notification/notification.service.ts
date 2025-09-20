import status from 'http-status';

import AppError from '@errors/appError.js';

import { DEDUPE_WINDOW_MS } from './notification.constant.js';
import type { TNotification } from './notification.interface.js';
import { Notification } from './notification.model.js';

const createNotificationIntoDB = async (
  userId: string,
  payload: Partial<TNotification>,
  systemTriggered: boolean,
): Promise<TNotification> => {
  if (!userId && !systemTriggered) {
    throw new AppError(status.BAD_REQUEST, 'UserId is required for normal notifications');
  }

  const finalUserId = userId || payload.user;
  if (!finalUserId) {
    throw new AppError(status.BAD_REQUEST, 'Cannot create notification without userId');
  }

  if (payload.dedupeKey) {
    const existing = await Notification.findOne({
      dedupeKey: payload.dedupeKey,
      user: finalUserId,
      isDeleted: false,
      createdAt: { $gte: new Date(Date.now() - DEDUPE_WINDOW_MS) },
    });
    if (existing) throw new AppError(status.BAD_REQUEST, 'Notification already exist!');
  }

  if (!payload.channels) {
    if (payload.type === 'order') payload.channels = ['in_app', 'push', 'email'];
    else if (payload.type === 'promotion') payload.channels = ['push', 'email'];
    else payload.channels = ['in_app'];
  }

  const result = await Notification.create(payload);

  return result;
};

export const NotificationService = {
  createNotificationIntoDB,
};
