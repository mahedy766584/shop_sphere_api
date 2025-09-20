/* eslint-disable @typescript-eslint/no-explicit-any */
import status from 'http-status';
import { Schema } from 'mongoose';

import catchAsync from '@utils/catchAsync.js';
import sendResponse from '@utils/sendResponse.js';

import AuditService from './auditLog.service.js';

const getAuditLogs = catchAsync(async (req, res) => {
  const {
    resourceType,
    resourceId,
    action,
    performedBy,
    dateFrom,
    dateTo,
    limit = 50,
    page = 1,
  } = req.query as any;

  const filter: any = {};
  if (resourceType) filter.resourceType = resourceType;
  if (resourceId) filter.resourceId = new Schema.Types.ObjectId(resourceId);
  if (action) filter.action = action;
  if (performedBy) filter.performedBy = new Schema.Types.ObjectId(performedBy);
  if (dateFrom || dateTo) filter.performedAt = {};
  if (dateFrom) filter.performedAt.$gte = new Date(dateFrom);
  if (dateTo) filter.performedAt.$lte = new Date(dateTo);

  const skip = (Number(page) - 1) * Number(limit);
  const logs = await AuditService.findAll(filter, { limit: Number(limit), skip });

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Audit logged successfully',
    data: {
      logs,
      meta: { limit: Number(limit), page: Number(page) },
    },
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
