import { Schema, model } from 'mongoose';

import type { TCart } from './cart.interface.js';

const cartSchema = new Schema<TCart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'User is required'] },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    priceAtAddTime: {
      type: Number,
      required: [true, 'Price at add time is required'],
      min: [0, 'Price must be a positive number'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount must be a positive number'],
    },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
cartSchema.index({ user: 1, product: 1 }, { unique: true });
export const Cart = model<TCart>('Cart', cartSchema);
