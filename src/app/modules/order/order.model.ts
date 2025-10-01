import { Schema, model } from 'mongoose';

import { OrderStatus, PaymentMethods, PaymentStatus } from './order.constant.js';
import type { TOrder } from './order.interface.js';

const ShippingSchema = new Schema(
  {
    name: { type: String, trim: true },
    street: {
      type: String,
      required: [true, 'Shipping street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Shipping city is required'],
      trim: true,
    },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: {
      type: String,
      required: [true, 'Shipping country is required'],
      trim: true,
    },
    phone: { type: String, trim: true },
  },
  { _id: false },
);

const PaymentSchema = new Schema(
  {
    method: {
      type: String,
      enum: {
        values: PaymentMethods,
        message: 'Payment method must be one of: {VALUE}',
      },
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: {
        values: PaymentStatus,
        message: 'Payment status must be one of: {VALUE}',
      },
      default: 'pending',
    },
    transactionId: { type: String, trim: true },
    gatewayResponse: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const OrderLogSchema = new Schema(
  {
    at: {
      type: Date,
      default: () => new Date(),
      required: [true, 'Order log timestamp is required'],
    },
    by: { type: Schema.Types.ObjectId, ref: 'User' },
    fromStatus: { type: String },
    toStatus: { type: String },
    note: { type: String, trim: true },
  },
  { _id: false },
);

const OrderSchema = new Schema<TOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must be associated with a user'],
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Order must include a product'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    priceAtAddTime: {
      type: Number,
      required: [true, 'Price at add time is required'],
      min: [0, 'Price cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative'],
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Total discount cannot be negative'],
    },
    finalAmount: {
      type: Number,
      required: [true, 'Final amount is required'],
      min: [0, 'Final amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'BDT',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: OrderStatus,
        message: 'Order status must be one of: {VALUE}',
      },
      default: 'pending',
      index: true,
    },
    payment: {
      type: PaymentSchema,
      required: [true, 'Payment information is required'],
    },
    shippingAddress: {
      type: ShippingSchema,
      required: [true, 'Shipping address is required'],
    },
    orderLogs: { type: [OrderLogSchema], default: [] },
    invoiceId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

OrderSchema.pre('validate', function (next) {
  if (!this.invoiceId) {
    const date = new Date();
    const short = Math.random().toString(36).slice(2, 8).toUpperCase();
    this.invoiceId = `ORD-${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${short}`;
  }
  next();
});

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ invoiceId: 1 });

export const Order = model<TOrder>('Order', OrderSchema);
