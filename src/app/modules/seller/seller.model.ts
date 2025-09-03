import { Schema, model } from 'mongoose';

import type { TSellerProfile } from './seller.interface.js';

const SellerProfileSchema = new Schema<TSellerProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    businessName: { type: String, required: true, trim: true },
    tradeLicense: { type: String, required: true },
    bankAccount: { type: String, required: true },
    documents: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const SellerProfile = model<TSellerProfile>('Seller', SellerProfileSchema);
