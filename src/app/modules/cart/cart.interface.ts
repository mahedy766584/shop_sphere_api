import type { Types } from 'mongoose';

export type TCart = {
  user: Types.ObjectId;
  product: Types.ObjectId | string;
  quantity: number;
  priceAtAddTime: number;
  totalAmount: number;
  addedAt: Date;
};
