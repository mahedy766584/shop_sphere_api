import status from 'http-status';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

import AuditService from './auditLog.service.js';

const getAuditLogs = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { result, meta } = await AuditService.findAllAuditLog(userId, req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Audit logged successfully',
    meta: meta,
    data: result,
  });
});

const getAuditLogById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const log = await AuditService.findById(id);
  if (!log) return res.status(404).json({ message: 'Log not found' });
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Audit logged successfully',
    data: log,
  });
});

export const AuditLogController = {
  getAuditLogs,
  getAuditLogById,
};
