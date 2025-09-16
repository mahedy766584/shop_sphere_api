import type { Types } from 'mongoose';

export type TProductDiscount = {
  _id?: string;
  productId: Types.ObjectId;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: Types.ObjectId;
};
