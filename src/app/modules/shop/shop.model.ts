import { model, Schema } from 'mongoose';

import type { TShop } from './shop.interface.js';

const shopeSchema = new Schema<TShop>(
  {
    name: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
      unique: true,
      minlength: [3, 'Shop name must be at least 3 characters long'],
      maxlength: [100, 'Shop name must not exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location must not exceed 200 characters'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'SellerProfile',
      required: [true, 'Shop owner is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Shop = model<TShop>('Shop', shopeSchema);
