import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import { Router } from 'express';

import { AuditLogController } from './auditLog.controller.js';
import { AuditLogValidation } from './auditLog.validation.js';

const router = Router();

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller),
  validateRequest(AuditLogValidation.getAuditLogsQuerySchema),
  AuditLogController.getAuditLogs,
);

router.get(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller),
  AuditLogController.getAuditLogById,
);

export const AuditLogRoutes = router;
