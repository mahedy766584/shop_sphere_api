/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, Types } from 'mongoose';

const productDiscountSchema = new Schema(
  {
    productId: {
      type: Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
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
      min: [0, 'Discount value cannot be negative'],
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
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'CreatedBy (seller/admin) is required'],
    },
  },
  { timestamps: true },
);

export const ProductDiscount = model('ProductDiscount', productDiscountSchema);
