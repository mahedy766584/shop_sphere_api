import type { TCoupon } from './coupon.interface.js';

export const allowedFields: (keyof TCoupon)[] = [
  'code',
  'discountType',
  'discountValue',
  'minPurchase',
  'maxDiscount',
  'startDate',
  'endDate',
  'isActive',
];
