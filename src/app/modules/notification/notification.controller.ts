import status from 'http-status';

import catchAsync from '@utils/catchAsync.js';
import sendResponse from '@utils/sendResponse.js';

import { NotificationService } from './notification.service.js';

const createNotificationIntoDB = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await NotificationService.createNotificationIntoDB(userId, req.body, false);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Notification has been created and queued for delivery',
    data: result,
  });
});

export const NotificationController = {
  createNotificationIntoDB,
};
