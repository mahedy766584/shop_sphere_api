import status from 'http-status';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

import NotificationService from './notification.service.js';

const getUserNotifications = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { meta, result } = await NotificationService.findAllByUser(userId, req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Notifications fetched successfully',
    meta,
    data: result,
  });
});

const markNotificationAsRead = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { notificationId } = req.params;
  const updated = await NotificationService.markAsRead(notificationId, userId);
  sendResponse(res, {
    statusCode: updated ? status.OK : status.NOT_FOUND,
    success: !!updated,
    message: updated ? 'Notification marked as read' : 'Notification not found or not yours',
    data: updated,
  });
});

const markAllNotificationsAsRead = catchAsync(async (req, res) => {
  const { userId } = req.user;

  await NotificationService.markAllAsRead(userId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'All notifications marked as read',
    data: '',
  });
});

// 🔹 soft delete a notification
const deleteNotification = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { notificationId } = req.params;

  const deleted = await NotificationService.softDelete(notificationId, userId);

  sendResponse(res, {
    statusCode: deleted ? status.OK : status.NOT_FOUND,
    success: !!deleted,
    message: deleted ? 'Notification deleted successfully' : 'Notification not found or not yours',
    data: deleted,
  });
});

// 🔹 prune old notifications (admin use case)
const pruneOldNotifications = catchAsync(async (req, res) => {
  const { date } = req.body;

  if (!date) {
    sendResponse(res, {
      statusCode: status.BAD_REQUEST,
      success: false,
      message: 'Date is required',
      data: '',
    });
    return;
  }

  const result = await NotificationService.pruneOlderThan(new Date(date));

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Old notifications pruned successfully',
    data: result,
  });
});

export const NotificationsControllers = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  pruneOldNotifications,
};
