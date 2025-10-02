import { Schema, model } from 'mongoose';

import type { TReview } from './review.interface.js';

const reviewSchema = new Schema<TReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    comment: {
      type: String,
      min: [5, 'Minimum rating is 5'],
      max: [250, 'Maximum rating is 250'],
    },
    images: {
      type: [String],
      default: [],
    },
    likes: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Review = model<TReview>('Review', reviewSchema);
