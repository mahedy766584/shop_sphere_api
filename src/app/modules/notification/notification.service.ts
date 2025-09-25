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

  // 🔹 fetch all user notifications (with QueryBuilder)
  static async findAllByUser(
    userId: string | Types.ObjectId,
    query: Record<string, unknown>, // req.query আসবে controller থেকে
  ) {
    // base filter
    const filter: any = { user: userId, isDeleted: false };
    if (query.unreadOnly === 'true') filter.isRead = false;

    // 🔹 base mongoose query
    const notificationQuery = Notification.find(filter);

    // 🔹 apply query builder
    const notificationQueryBuilder = new QueryBuilder(notificationQuery, query)
      .search(['title', 'message']) // searchable fields
      .filter()
      .sort()
      .paginate()
      .fields();

    // execute query
    const result = await notificationQueryBuilder.modelQuery.lean();

    // pagination meta
    const meta = await notificationQueryBuilder.countTotal();

    return { meta, result };
  }

  // 🔹 mark as read
  static async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true },
    );
  }

  // 🔹 mark all read
  static async markAllAsRead(userId: string) {
    return Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );
  }

  // 🔹 delete notification (soft delete)
  static async softDelete(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { $set: { isDeleted: true } },
      { new: true },
    );
  }

  // 🔹 prune old notifications
  static async pruneOlderThan(date: Date) {
    return Notification.deleteMany({ createdAt: { $lt: date } });
  }
}

export default NotificationService;
