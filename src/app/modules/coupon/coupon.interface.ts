import type { Types } from 'mongoose';

export type TCoupon = {
  _id?: Types.ObjectId;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
  createdBy: Types.ObjectId;
};
