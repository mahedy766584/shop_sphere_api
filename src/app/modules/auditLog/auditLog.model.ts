import { Schema, model } from 'mongoose';

const auditLogSchema = new Schema(
  {
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: Schema.Types.ObjectId, required: true, index: true },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'custom', 'verify', 'unVerify', 'restore'],
      required: true,
    },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    performedAt: { type: Date, default: Date.now, index: true },

    previousData: { type: Schema.Types.Mixed, default: null },
    newData: { type: Schema.Types.Mixed, default: null },

    meta: { type: Schema.Types.Mixed, default: null },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

auditLogSchema.index({ resourceType: 1, resourceId: 1, performedAt: -1 });

export const AuditLog = model('AuditLog', auditLogSchema);
