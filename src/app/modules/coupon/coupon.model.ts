/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from 'mongoose';

import { couponType } from './coupon.constant.js';
import type { TCoupon } from './coupon.interface.js';

const couponSchema = new Schema<TCoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'Coupon code must be at least 3 characters long'],
      maxlength: [20, 'Coupon code cannot exceed 20 characters'],
    },

    couponType: {
      type: String,
      enum: {
        values: couponType,
        message: 'Coupon type must be one of: flat, percentage, free_shipping, bxgy',
      },
      required: [true, 'Coupon type is required'],
    },

    couponValue: {
      type: Number,
      min: [1, 'Discount value must be at least 1'],
    },

    minOrderAmount: {
      type: Number,
      min: [0, 'Minimum order amount must be greater than or equal to 0'],
    },

    maxCouponAmount: {
      type: Number,
      min: [0, 'Maximum discount must be greater than or equal to 0'],
    },

    usageLimit: {
      type: Number,
      min: [1, 'Usage limit must be at least 1'],
    },

    perUserLimit: {
      type: Number,
      min: [1, 'Per-user limit must be at least 1'],
    },

    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },

    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (this: any, value: Date) {
          return !this.startDate || value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'CreatedBy is required'],
      immutable: true,
    },

    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: [true, 'Shop is required'],
      immutable: true,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    userUsed: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

couponSchema.index({ code: 1 }, { unique: true });

export const Coupon = model<TCoupon>('Coupon', couponSchema);
