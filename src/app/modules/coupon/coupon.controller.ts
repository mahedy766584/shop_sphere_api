import status from 'http-status';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

import { CouponService } from './coupon.service.js';

const createCouponIntoDB = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await CouponService.createCouponIntoDB(userId, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product coupon created successfully',
    data: result,
  });
});

const getAllCouponsFromDB = catchAsync(async (req, res) => {
  const result = await CouponService.getAllCouponsFromDB();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product coupon retrieved successfully',
    data: result,
  });
});

const getActiveCoupons = catchAsync(async (req, res) => {
  const result = await CouponService.getActiveCoupons();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product coupon retrieved successfully',
    data: result,
  });
});

const updateCouponIntoDB = catchAsync(async (req, res) => {
  const { userId, role } = req.user;
  const { couponId } = req.params;
  const result = await CouponService.updateCouponIntoDB(userId, couponId, req.body, role!);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product coupon updated successfully',
    data: result,
  });
});

const deleteCoupon = catchAsync(async (req, res) => {
  const { userId, role } = req.user;
  const { couponId } = req.params;

  const result = await CouponService.deleteCoupon(userId, couponId, role!);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product coupon deleted successfully',
    data: result,
  });
});

export const CouponController = {
  createCouponIntoDB,
  getAllCouponsFromDB,
  getActiveCoupons,
  updateCouponIntoDB,
  deleteCoupon,
};
