/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from 'app/builder/QueryBuilder.js';
import type { ClientSession, Types } from 'mongoose';

import type { TNotification } from './notification.interface.js';
import { Notification } from './notification.model.js';

class NotificationService {
  static async create(
    data: Omit<TNotification, 'readAt' | 'createdAt' | 'updatedAt'>,
    options?: { session?: ClientSession },
  ) {
    return Notification.create([{ ...data, isRead: false, readAt: undefined }], {
      session: options?.session,
    });
  }

  static async createForUser(
    params: {
      user: Types.ObjectId | string;
      type: TNotification['type'];
      title?: string;
      message: string;
      channels?: TNotification['channels'];
      metadata?: Record<string, any>;
      locale?: string;
      priority?: TNotification['priority'];
      dedupeKey?: string;
    },
    options?: { session?: ClientSession },
  ) {
    const {
      user,
      type,
      title,
      message,
      channels = ['in_app'],
      metadata,
      locale = 'en',
      priority = 'normal',
      dedupeKey,
    } = params;

    return Notification.create(
      [
        {
          user,
          type,
          title,
          message,
          channels,
          metadata: metadata ?? {},
          locale,
          priority,
          dedupeKey,
          isRead: false,
          readAt: undefined,
          isDeleted: false,
        },
      ],
      { session: options?.session },
    );
  }

  static async findAllByUser(userId: string | Types.ObjectId, query: Record<string, unknown>) {
    const filter: any = { user: userId, isDeleted: false };
    if (query.unreadOnly === 'true') filter.isRead = false;

    const notificationQuery = Notification.find(filter);

    const notificationQueryBuilder = new QueryBuilder(notificationQuery, query)
      .search(['title', 'message'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const result = await notificationQueryBuilder.modelQuery.lean();

    const meta = await notificationQueryBuilder.countTotal();

    return { meta, result };
  }

  static async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true },
    );
  }

  static async markAllAsRead(userId: string) {
    return Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );
  }

  static async softDelete(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { $set: { isDeleted: true } },
      { new: true },
    );
  }

  static async pruneOlderThan(date: Date) {
    return Notification.deleteMany({ createdAt: { $lt: date } });
  }
}

export default NotificationService;
