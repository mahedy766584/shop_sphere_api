import AuditService from '@modules/auditLog/auditLog.service.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const createAudit = async (params: {
  resourceType: string;
  resourceId: any;
  action: 'create' | 'update' | 'delete' | 'custom';
  performedBy: any;
  previousData?: any;
  newData?: any;
  meta?: any;
}) => {
  return AuditService.createFromDocs(params);
};
