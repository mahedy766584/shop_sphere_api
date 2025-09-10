import { Schema, model } from 'mongoose';

import type { TCart, TItems } from './cart.interface.js';

const itemSchema = new Schema<TItems>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    priceAtAddTime: {
      type: Number,
      required: true, // server বসাবে
    },
  },
  { _id: false },
);

const cartSchema = new Schema<TCart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // প্রতি user-এর জন্য একটাই cart
    },
    items: [itemSchema],
    totalAmount: {
      type: Number,
      default: 0, // server calculate করবে
    },
  },
  { timestamps: true },
);

export const Cart = model<TCart>('Cart', cartSchema);
