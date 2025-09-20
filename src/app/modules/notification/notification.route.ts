import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import { Router } from 'express';

import { NotificationController } from './notification.controller.js';
import { NotificationValidation } from './notification.validation.js';

const router = Router();

router.post(
  '/create-notification',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  validateRequest(NotificationValidation.CreateNotificationSchema),
  NotificationController.createNotificationIntoDB,
);

export const NotificationRoutes = router;
