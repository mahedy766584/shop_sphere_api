/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from 'app/builder/QueryBuilder.js';
import status from 'http-status';
import { Types } from 'mongoose';

import AppError from '@errors/appError.js';

import { checkShopOwnership } from '@utils/guards/checkShopOwnership.js';
import { checkUserStatus } from '@utils/guards/checkUserStatus.js';
import { toObjectId } from '@utils/validators/objectId.js';
import { validateDates } from '@utils/validators/validateDates.js';
import { validateDiscountValue } from '@utils/validators/validateDiscountValue.js';

import { allowedFields } from './coupon.constant.js';
import type { TCoupon } from './coupon.interface.js';
import { Coupon } from './coupon.model.js';
import { normalizeDate } from './coupon.utils.js';

const createCouponIntoDB = async (userId: string, payload: TCoupon) => {
  validateDates(payload.startDate, payload.endDate);
  validateDiscountValue(payload.couponType, payload.couponValue);

  if (payload.minOrderAmount && payload.minOrderAmount <= 0) {
    throw new AppError(status.BAD_REQUEST, 'Minimum order amount must be greater than 0.');
  }

  if (payload.maxCouponAmount && payload.maxCouponAmount <= 0) {
    throw new AppError(status.BAD_REQUEST, 'Max discount amount must be greater than 0.');
  }

  const existing = await Coupon.findOne({ code: payload.code.toUpperCase() });
  if (existing) {
    throw new AppError(status.BAD_REQUEST, 'Coupon code already exists.');
  }

  const shop = await checkShopOwnership(payload.shop.toString(), userId);

  const user = await checkUserStatus(userId);

  const couponData: TCoupon = {
    ...payload,
    code: payload.code.toUpperCase(),
    createdBy: toObjectId(user._id),
    shop: toObjectId(shop._id.toString()),
    isActive: payload.isActive ?? true,
    usedCount: 0,
    userUsed: [],
  };

  const created = (await Coupon.create(couponData)).populate('shop', 'name');
  return created;
};

const getAllCouponsFromDB = async (query: Record<string, unknown>) => {
  const couponQuery = new QueryBuilder(
    Coupon.find()
      .populate('createdBy', 'name.firstName name.lastName email')
      .populate('shop', 'name'),
    query,
  )
    .search(['code'])
    .fields()
    .filter()
    .paginate()
    .sort();

  const result = await couponQuery.modelQuery;
  const meta = await couponQuery.countTotal();
  return { result, meta };
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

  // 6️⃣ Pick only allowed fields
  const updateData: Partial<TCoupon> = {};
  for (const key of allowedFields) {
    if (payload[key] !== undefined) {
      updateData[key] = payload[key] as any;
    }
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

  // 9️⃣ Overlapping check (only if dates changed)
  if (payload.startDate || payload.endDate) {
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
  Object.assign(coupon, updateData, { startDate: newStart, endDate: newEnd });
  await coupon.save();

  return await coupon.populate('createdBy', 'name.firstName name.lastName email');
};

const deleteCoupon = async (
  userId: string,
  couponId: string,
  role?: 'superAdmin' | 'admin' | 'seller' | 'customer',
) => {
  const now = new Date();

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

  // 4️⃣ Prevent deleting running coupon
  if (coupon.startDate <= now && coupon.endDate >= now && coupon.isActive) {
    throw new AppError(status.BAD_REQUEST, 'Cannot delete a coupon that is currently active');
  }

  // 5️⃣ Soft delete (mark as deleted instead of removing)
  coupon.isActive = false;
  (coupon as any).isDeleted = true; // 👉 add `isDeleted: { type: Boolean, default: false }` in schema
  await coupon.save();

  return coupon;
};

const applyCoupon = async (code: string, userId: string, orderAmount: number) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) throw new AppError(status.BAD_REQUEST, 'Invalid coupon');
  if (!coupon.isActive) throw new AppError(status.FORBIDDEN, 'Coupon is inactive');

  const now = new Date();
  if (coupon.startDate > now || coupon.endDate < now) throw new Error('Coupon expired');

  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount)
    throw new Error(`Order must be at least ${coupon.minOrderAmount}`);

  // Usage limits
  if (coupon.usageLimit && coupon.usedCount! >= coupon.usageLimit)
    throw new Error('Coupon usage limit reached');

  const userUsage = coupon.userUsed?.find((u) => u.userId.toString() === userId);
  if (coupon.perUserLimit && userUsage && userUsage.count >= coupon.perUserLimit)
    throw new Error('You have already used this coupon maximum times');

  // Calculate discount
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (orderAmount * (coupon.discountValue ?? 0)) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount)
      discount = coupon.maxDiscountAmount;
  } else if (coupon.type === 'flat') {
    discount = coupon.discountValue ?? 0;
  }

  // Update usage counts
  coupon.usedCount = (coupon.usedCount ?? 0) + 1;
  if (userUsage) {
    userUsage.count += 1;
  } else {
    coupon.userUsed?.push({ userId, count: 1 });
  }
  await coupon.save();

  return { discount, finalAmount: orderAmount - discount };
};

export const CouponService = {
  createCouponIntoDB,
  getAllCouponsFromDB,
  getActiveCoupons,
  updateCouponIntoDB,
  deleteCoupon,
  applyCoupon,
};
