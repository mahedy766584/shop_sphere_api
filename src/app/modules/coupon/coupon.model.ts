/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from 'mongoose';

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

    discountType: {
      type: String,
      enum: {
        values: ['percentage', 'flat'],
        message: 'Discount type must be either "percentage" or "flat"',
      },
      required: [true, 'Discount type is required'],
    },

    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [1, 'Discount value must be at least 1'],
    },

    minPurchase: {
      type: Number,
      min: [0, 'Minimum purchase must be a positive number'],
    },

    maxDiscount: {
      type: Number,
      min: [0, 'Maximum discount must be a positive number'],
      validate: {
        validator: function (this: any, value: number) {
          return this.discountType === 'percentage' ? value > 0 : true;
        },
        message: 'Max discount is only required for percentage discount type',
      },
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

couponSchema.index({ code: 1 });

export const Coupon = model('Coupon', couponSchema);
