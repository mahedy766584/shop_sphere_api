import { Schema, model } from 'mongoose';

import type { TCart, TItems } from './cart.interface.js';

const itemsSchema = new Schema<TItems>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
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
  },
  { _id: false },
);

const cartSchema = new Schema<TCart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
    },
    items: {
      type: [itemsSchema],
      validate: {
        validator: (v: TItems[]) => Array.isArray(v) && v.length > 0,
        message: 'Cart must have at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
  },
  {
    timestamps: true,
  },
);

export const Cart = model<TCart>('Cart', cartSchema);
