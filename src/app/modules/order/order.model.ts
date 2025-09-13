import { Schema, model } from 'mongoose';

import { OrderStatus, PaymentMethods, PaymentStatus } from './order.constant.js';
import type { TOrder } from './order.interface.js';

const ShippingSchema = new Schema(
  {
    name: { type: String },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false },
);

const PaymentSchema = new Schema(
  {
    method: { type: String, enum: PaymentMethods, required: true },
    status: { type: String, enum: PaymentStatus, default: 'pending' },
    transactionId: { type: String, trim: true },
    gatewayResponse: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const OrderLogSchema = new Schema(
  {
    at: { type: Date, default: () => new Date(), required: true },
    by: { type: Schema.Types.ObjectId, ref: 'User' },
    fromStatus: { type: String },
    toStatus: { type: String },
    note: { type: String },
  },
  { _id: false },
);

const OrderSchema = new Schema<TOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: [1, 'Quantity >= 1'] },
    priceAtAddTime: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    totalDiscount: { type: Number, default: 0, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'BDT' },
    status: {
      type: String,
      enum: OrderStatus,
      default: 'pending',
      index: true,
    },
    payment: { type: PaymentSchema, required: true },
    shippingAddress: { type: ShippingSchema, required: true },
    reserved: { type: Boolean, default: true },
    orderLogs: { type: [OrderLogSchema], default: [] },
    invoiceId: { type: String, unique: true, sparse: true },
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
    this.invoiceId = `ORD-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${short}`;
  }
  next();
});

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ invoiceId: 1 });

export const Order = model<TOrder>('Order', OrderSchema);
