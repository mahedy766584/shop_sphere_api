import { Schema, model } from 'mongoose';

import type { TSellerProfile } from './seller.interface.js';

const SellerProfileSchema = new Schema<TSellerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: [true, 'User reference is required for seller profile.'],
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required.'],
      unique: true,
      trim: true,
      minlength: [3, 'Business name must be at least 3 characters long.'],
      maxlength: [100, 'Business name cannot exceed 100 characters.'],
    },
    tradeLicense: {
      type: String,
      unique: true,
      required: [true, 'Trade license number is required.'],
      minlength: [6, 'Trade license must be at least 6 characters long.'],
    },
    bankAccount: {
      type: String,
      unique: true,
      required: [true, 'Bank account number is required.'],
      match: [/^\d+$/, 'Bank account must contain only numbers.'],
      minlength: [8, 'Bank account number must be at least 8 digits.'],
    },
    documents: [
      {
        type: String,
        validate: {
          validator: (val: string) => val.startsWith('http'),
          message: 'Each document must be a valid URL.',
        },
      },
    ],
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'suspended'],
        message: 'Status must be either pending, approved, or rejected.',
      },
      default: 'pending',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const SellerProfile = model<TSellerProfile>('SellerProfile', SellerProfileSchema);
