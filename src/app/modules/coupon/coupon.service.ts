/* eslint-disable @typescript-eslint/no-explicit-any */
import status from 'http-status';
import { Types } from 'mongoose';

import AppError from '@errors/appError.js';

import { allowedFields } from './coupon.constant.js';
import type { TCoupon } from './coupon.interface.js';
import { Coupon } from './coupon.model.js';

const createCouponIntoDB = async (userId: string, payload: TCoupon) => {
  // 1️⃣ Validate date logic
  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  if (startDate >= endDate) {
    throw new AppError(status.BAD_REQUEST, 'Start date must be before end date.');
  }

  if (startDate < new Date()) {
    throw new AppError(status.BAD_REQUEST, 'Start date cannot be in the past.');
  }

  const duration = endDate.getTime() - startDate.getTime();
  if (duration > 90 * 24 * 60 * 60 * 1000) {
    throw new AppError(status.BAD_REQUEST, 'Coupon duration cannot exceed 90 days.');
  }

  // 2️⃣ Validate discount value based on type
  if (
    payload.discountType === 'percentage' &&
    (payload.discountValue <= 0 || payload.discountValue > 100)
  ) {
    throw new AppError(status.BAD_REQUEST, 'Percentage discount must be between 1 and 100.');
  }

  if (payload.discountType === 'flat' && payload.discountValue <= 0) {
    throw new AppError(status.BAD_REQUEST, 'Flat discount must be greater than 0.');
  }

  // 3️⃣ Optional numeric validations
  if (payload.minPurchase && payload.minPurchase <= 0) {
    throw new AppError(status.BAD_REQUEST, 'Minimum purchase must be greater than 0.');
  }

  if (payload.maxDiscount && payload.maxDiscount <= 0) {
    throw new AppError(status.BAD_REQUEST, 'Max discount must be greater than 0.');
  }

  // 4️⃣ Ensure coupon code is unique (case-insensitive)
  const existing = await Coupon.findOne({ code: payload.code.toUpperCase() });
  if (existing) {
    throw new AppError(status.BAD_REQUEST, 'Coupon code already exists.');
  }

  // 5️⃣ Normalize and assign meta data
  const couponData: TCoupon = {
    ...payload,
    code: payload.code.toUpperCase(),
    createdBy: userId as any,
    isActive: payload.isActive ?? true,
  };

  // 6️⃣ Create and return
  const created = await Coupon.create(couponData);
  return created;
};

const getAllCouponsFromDB = async () => {
  return await Coupon.find()
    .populate('createdBy', 'name.firstName name.lastName email')
    .sort({ createdAt: -1 });
};

const getActiveCoupons = async () => {
  const now = new Date();
  const result = await Coupon.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .populate('createdBy', 'name.firstName name.lastName email')
    .sort({ createdAt: 1 });

  return result;
};

const normalizeDate = (date: string | Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); // normalize to midnight to avoid millisecond mismatch
  return d;
};

const updateCouponIntoDB = async (
  userId: string,
  couponId: string,
  payload: Partial<TCoupon>,
  role?: 'superAdmin' | 'admin' | 'seller' | 'customer',
) => {
  const now = new Date();

  // 1️⃣ Validate couponId
  if (!Types.ObjectId.isValid(couponId)) {
    throw new AppError(status.BAD_REQUEST, 'Invalid coupon id');
  }

  // 2️⃣ Find existing coupon
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new AppError(status.NOT_FOUND, 'Coupon not found');
  }

  // 3️⃣ Ownership or role check
  if (role === 'seller' && coupon.createdBy.toString() !== userId.toString()) {
    throw new AppError(status.FORBIDDEN, 'You are not allowed to update this coupon');
  }

  // 4️⃣ Prevent editing expired coupon
  if (coupon.endDate < now) {
    throw new AppError(status.BAD_REQUEST, 'Cannot update an expired coupon');
  }

  // 5️⃣ Handle code update & uniqueness
  if (payload.code && payload.code.toUpperCase() !== coupon.code) {
    const codeExists = await Coupon.findOne({ code: payload.code.toUpperCase() });
    if (codeExists) {
      throw new AppError(status.CONFLICT, 'Coupon code already exists');
    }
    payload.code = payload.code.toUpperCase();
  }

  // 6️⃣ Prepare allowed fields
  const updateData: Partial<TCoupon> = {};
  for (const key of allowedFields) {
    if (payload[key] !== undefined) updateData[key] = payload[key] as any;
  }

  // 7️⃣ Dates normalization
  const newStart = payload.startDate
    ? normalizeDate(payload.startDate)
    : normalizeDate(coupon.startDate);
  const newEnd = payload.endDate ? normalizeDate(payload.endDate) : normalizeDate(coupon.endDate);

  // 8️⃣ Dates validation
  if (newStart < now) {
    throw new AppError(status.BAD_REQUEST, 'Start date must be in the future');
  }
  if (newEnd <= newStart) {
    throw new AppError(status.BAD_REQUEST, 'End date must be after start date');
  }

  // 9️⃣ Overlapping check (ignore self)
  if (payload.startDate || payload.endDate) {
    // check only if dates changed
    const overlapping = await Coupon.findOne({
      _id: { $ne: couponId },
      createdBy: coupon.createdBy,
      $or: [
        { startDate: { $lte: newEnd }, endDate: { $gte: newStart } },
        { startDate: { $lte: newStart }, endDate: { $gte: newEnd } },
      ],
    });

    if (overlapping) {
      throw new AppError(
        status.BAD_REQUEST,
        'Another active coupon overlaps with this date range.',
      );
    }
  }

  // 🔟 Update coupon
  Object.assign(coupon, updateData);
  await coupon.save();

  return await coupon.populate('createdBy', 'name.firstName name.lastName email');
};

const deleteCoupon = async (
  userId: string,
  couponId: string,
  role?: 'superAdmin' | 'admin' | 'seller' | 'customer',
) => {
  // 1️⃣ Validate couponId
  if (!Types.ObjectId.isValid(couponId)) {
    throw new AppError(status.BAD_REQUEST, 'Invalid coupon id');
  }

  // 2️⃣ Find coupon
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new AppError(status.NOT_FOUND, 'Coupon not found');
  }

  // 3️⃣ Ownership & role check
  if (role === 'seller' && coupon.createdBy.toString() !== userId.toString()) {
    throw new AppError(status.FORBIDDEN, 'You are not allowed to delete this coupon');
  }

  // 4️⃣ Prevent deleting active or future coupons
  const now = new Date();
  if (coupon.isActive && coupon.startDate <= now) {
    throw new AppError(status.BAD_REQUEST, 'Cannot delete a coupon that is currently active');
  }

  if (coupon.startDate > now) {
    throw new AppError(status.BAD_REQUEST, 'Cannot delete a coupon that is not yet active');
  }

  // 5️⃣ Soft delete (industry standard)
  coupon.isActive = false;
  await coupon.save();

  return coupon;
};

//TODO
// const applyCoupon = async (code: string, userId: string, orderAmount: number) => {
//   const coupon = await Coupon.findOne({ code: code.toUpperCase() });
//   if (!coupon) throw new Error('Invalid coupon');
//   if (!coupon.isActive) throw new Error('Coupon is inactive');

//   const now = new Date();
//   if (coupon.startDate > now || coupon.endDate < now) throw new Error('Coupon expired');

//   if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount)
//     throw new Error(`Order must be at least ${coupon.minOrderAmount}`);

//   // Usage limits
//   if (coupon.usageLimit && coupon.usedCount! >= coupon.usageLimit)
//     throw new Error('Coupon usage limit reached');

//   const userUsage = coupon.userUsed?.find((u) => u.userId.toString() === userId);
//   if (coupon.perUserLimit && userUsage && userUsage.count >= coupon.perUserLimit)
//     throw new Error('You have already used this coupon maximum times');

//   // Calculate discount
//   let discount = 0;
//   if (coupon.type === 'percentage') {
//     discount = (orderAmount * (coupon.discountValue ?? 0)) / 100;
//     if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount)
//       discount = coupon.maxDiscountAmount;
//   } else if (coupon.type === 'flat') {
//     discount = coupon.discountValue ?? 0;
//   }

//   // Update usage counts
//   coupon.usedCount = (coupon.usedCount ?? 0) + 1;
//   if (userUsage) {
//     userUsage.count += 1;
//   } else {
//     coupon.userUsed?.push({ userId, count: 1 });
//   }
//   await coupon.save();

//   return { discount, finalAmount: orderAmount - discount };
// };

export const CouponService = {
  createCouponIntoDB,
  getAllCouponsFromDB,
  getActiveCoupons,
  updateCouponIntoDB,
  deleteCoupon,
};
