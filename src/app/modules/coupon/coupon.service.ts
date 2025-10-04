/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TShop } from '@modules/shop/shop.interface.js';
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

  if (!Types.ObjectId.isValid(couponId)) {
    throw new AppError(status.BAD_REQUEST, 'Invalid coupon id');
  }

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new AppError(status.NOT_FOUND, 'Coupon not found');
  }

  if (role === 'seller' && coupon.createdBy.toString() !== userId.toString()) {
    throw new AppError(status.FORBIDDEN, 'You are not allowed to update this coupon');
  }

  if (coupon.endDate < now) {
    throw new AppError(status.BAD_REQUEST, 'Cannot update an expired coupon');
  }

  if (payload.code && payload.code.toUpperCase() !== coupon.code) {
    const codeExists = await Coupon.findOne({ code: payload.code.toUpperCase() });
    if (codeExists) {
      throw new AppError(status.CONFLICT, 'Coupon code already exists');
    }
    payload.code = payload.code.toUpperCase();
  }

  const updateData: Partial<TCoupon> = {};
  for (const key of allowedFields) {
    if (payload[key] !== undefined) {
      updateData[key] = payload[key] as any;
    }
  }

  const newStart = payload.startDate
    ? normalizeDate(payload.startDate)
    : normalizeDate(coupon.startDate);

  const newEnd = payload.endDate ? normalizeDate(payload.endDate) : normalizeDate(coupon.endDate);

  if (newStart < now) {
    throw new AppError(status.BAD_REQUEST, 'Start date must be in the future');
  }
  if (newEnd <= newStart) {
    throw new AppError(status.BAD_REQUEST, 'End date must be after start date');
  }

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

  if (!Types.ObjectId.isValid(couponId)) {
    throw new AppError(status.BAD_REQUEST, 'Invalid coupon id');
  }

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new AppError(status.NOT_FOUND, 'Coupon not found');
  }

  if (role === 'seller' && coupon.createdBy.toString() !== userId.toString()) {
    throw new AppError(status.FORBIDDEN, 'You are not allowed to delete this coupon');
  }

  if (coupon.startDate <= now && coupon.endDate >= now && coupon.isActive) {
    throw new AppError(status.BAD_REQUEST, 'Cannot delete a coupon that is currently active');
  }

  coupon.isActive = false;
  (coupon as any).isDeleted = true;
  await coupon.save();

  return coupon;
};

const applyCoupon = async (code: string, userId: string, orderAmount: number) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() }).populate<{ shop: TShop }>(
    'shop',
    'name isActive isDeleted isVerified',
  );

  if (!coupon) throw new AppError(status.BAD_REQUEST, 'Invalid coupon code.');
  if (!coupon.isActive) throw new AppError(status.FORBIDDEN, 'Coupon is inactive.');

  if (!coupon.shop || !coupon.shop.isActive || coupon.shop.isDeleted || !coupon.shop.isVerified) {
    throw new AppError(status.BAD_REQUEST, 'This coupon belongs to an invalid or inactive shop.');
  }

  const user = await checkUserStatus(userId);

  const now = new Date();
  if (coupon.startDate > now || coupon.endDate < now) {
    throw new AppError(status.BAD_REQUEST, 'This coupon has expired or is not yet active.');
  }

  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    throw new AppError(
      status.BAD_REQUEST,
      `Order must be at least ${coupon.minOrderAmount} to use this coupon.`,
    );
  }

  if (coupon.usageLimit && coupon.usedCount! >= coupon.usageLimit) {
    throw new AppError(status.BAD_REQUEST, 'Coupon usage limit reached.');
  }

  const userUsage = coupon.userUsed?.find((u) => u.userId.toString() === user._id.toString());
  if (coupon.perUserLimit && userUsage && userUsage.count >= coupon.perUserLimit) {
    throw new AppError(status.BAD_REQUEST, 'You have already used this coupon maximum times.');
  }

  let discount = 0;

  switch (coupon.couponType) {
    case 'percentage':
      discount = (orderAmount * (coupon.couponValue ?? 0)) / 100;
      if (coupon.maxCouponAmount && discount > coupon.maxCouponAmount) {
        discount = coupon.maxCouponAmount;
      }
      break;

    case 'flat':
      discount = coupon.couponValue ?? 0;
      break;

    case 'free_shipping':
      discount = 100;
      break;

    case 'bxgy':
      discount = 0;
      break;
  }

  const finalAmount = Math.max(orderAmount - discount, 0);

  coupon.usedCount = (coupon.usedCount ?? 0) + 1;
  if (userUsage) {
    userUsage.count += 1;
  } else {
    coupon.userUsed?.push({ userId: toObjectId(user._id), count: 1 });
  }
  await coupon.save();

  return {
    coupon: {
      code: coupon.code,
      type: coupon.couponType,
      shop: coupon.shop.name,
    },
    discount,
    finalAmount,
  };
};

export const CouponService = {
  createCouponIntoDB,
  getAllCouponsFromDB,
  getActiveCoupons,
  updateCouponIntoDB,
  deleteCoupon,
  applyCoupon,
};
