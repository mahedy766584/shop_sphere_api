import type { Types } from 'mongoose';

export type TCoupon = {
  _id?: Types.ObjectId;
  code: string;
  couponType: 'flat' | 'percentage' | 'free_shipping' | 'bxgy';
  couponValue?: number;
  minOrderAmount?: number;
  maxCouponAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: Types.ObjectId;
  shop: Types.ObjectId;
  usedCount?: number;
  userUsed?: { userId: Types.ObjectId; count: number }[];
};
