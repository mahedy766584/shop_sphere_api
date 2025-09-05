import type { Types } from 'mongoose';

export type TItems = {
  product: Types.ObjectId;
  quantity: number;
  priceAtAddTime: number;
};

export type TCart = {
  user: Types.ObjectId;
  items: TItems[];
  totalAmount: number;
};
