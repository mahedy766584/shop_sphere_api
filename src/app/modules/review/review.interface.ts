import type { Types } from 'mongoose';

export type TReview = {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
};
