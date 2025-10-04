/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from 'app/builder/QueryBuilder.js';
import type { ClientSession, Types } from 'mongoose';

import type { TAuditLog } from './auditLog.interface.js';
import { AuditLog } from './auditLog.model.js';

class AuditService {
  static async create(log: Omit<TAuditLog, 'performedAt'>, options?: { session?: ClientSession }) {
    return AuditLog.create([{ ...log, performedAt: new Date() }], {
      session: options?.session,
    });
  }

  static async createFromDocs(
    params: {
      resourceType: string;
      resourceId: Types.ObjectId | string;
      action: TAuditLog['action'];
      performedBy: Types.ObjectId | string;
      previousData?: any;
      newData?: any;
      meta?: Record<string, any> | null;
    },
    options?: { session?: ClientSession },
  ) {
    const { resourceType, resourceId, action, performedBy, previousData, newData, meta } = params;

    // safe serialization helper
    const safe = (obj: any) => {
      if (!obj) return null;
      try {
        if (typeof obj.toOject === 'function') return obj.toObject();
        return JSON.parse(JSON.stringify(obj));
      } catch {
        return { _error: 'serialize_failed 🏑' };
      }
    };

    return AuditLog.create(
      [
        {
          resourceType,
          resourceId,
          action,
          performedBy,
          performedAt: new Date(),
          previousData: safe(previousData),
          newData: safe(newData),
          meta: meta ?? null,
        },
      ],
      { session: options?.session },
    );
  }

  static async findAllAuditLog(userId: string | Types.ObjectId, query: Record<string, unknown>) {
    const auditLogQueryBuilder = new QueryBuilder(AuditLog.find({ performedBy: userId }), query)
      .search(['resourceType', 'action'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const result = await auditLogQueryBuilder.modelQuery.lean();

    const meta = await auditLogQueryBuilder.countTotal();

    return { meta, result };
  }

  static async findById(id: string) {
    return AuditLog.findById(id).lean();
  }

  static async pruneOlderThan(date: Date) {
    return AuditLog.deleteMany({ performedAt: { $lt: date } });
  }
}

export default AuditService;
