import auth from '@middlewares/auth.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import { Router } from 'express';

import { NotificationsControllers } from './notification.controller.js';

const router = Router();

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  NotificationsControllers.getUserNotifications,
);

router.patch(
  '/:notificationId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  NotificationsControllers.markNotificationAsRead,
);

router.patch(
  '/mark/all-read',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  NotificationsControllers.markAllNotificationsAsRead,
);

router.delete(
  '/:notificationId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  NotificationsControllers.deleteNotification,
);

router.delete(
  '/notifications',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  NotificationsControllers.pruneOldNotifications,
);

export const NotificationRoutes = router;
