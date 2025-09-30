/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Types } from 'mongoose';

export type TAuditLog = {
  _id?: Types.ObjectId | string;
  resourceType: string;
  resourceId: Types.ObjectId | string;
  action: 'create' | 'update' | 'delete' | 'verify' | 'unVerify' | 'custom' | 'restore';
  performedBy: Types.ObjectId | string;
  performedAt?: Date;
  previousData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
  meta?: Record<string, any> | null;
};
