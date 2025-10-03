import type { TCoupon } from './coupon.interface.js';

export const allowedFields: (keyof TCoupon)[] = [
  'code',
  'couponType',
  'couponValue',
  'minOrderAmount',
  'maxCouponAmount',
  'usageLimit',
  'perUserLimit',
  'startDate',
  'endDate',
  'isActive',
];

export const couponType = ['flat', 'percentage', 'free_shipping', 'bxgy'];
