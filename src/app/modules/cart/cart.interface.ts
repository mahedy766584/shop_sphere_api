import type { Types } from 'mongoose';

export type TItems = {
  product: Types.ObjectId | string;
  quantity: number;
  priceAtAddTime: number;
  originalPrice: number;
};

export type TCart = {
  user: Types.ObjectId;
  items: TItems[];
  totalAmount: number;
};
