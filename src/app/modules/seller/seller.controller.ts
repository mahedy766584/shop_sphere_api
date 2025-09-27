import status from 'http-status';

import { SuccessMessages } from '@constants/successMessages.js';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

import { SellerProfileService } from './seller.service.js';

const applyForSellerIntoDB = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await SellerProfileService.applyForSellerIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.SELLER.SELLER_CREATED,
    data: result,
  });
});

const updateMySellerProfileIntoDB = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await SellerProfileService.updateMySellerProfileIntoDB(userId, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.SELLER.UPDATED,
    data: result,
  });
});

const updateSellerStatusIntoDB = catchAsync(async (req, res) => {
  const { sellerId } = req.params;
  const { status: newStatus } = req.body;
  const result = await SellerProfileService.updateSellerStatusIntoDB(sellerId, newStatus);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.SELLER.UPDATED_STATUS,
    data: result,
  });
});

const getAllSellerFromDB = catchAsync(async (req, res) => {
  const result = await SellerProfileService.getAllSellerFromDB(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.SELLER.RETRIEVED,
    meta: result.meta,
    data: result.result,
  });
});

const getMySellerProfileFromDB = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await SellerProfileService.getMySellerProfileFromDB(userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.SELLER.S_P_RETRIEVED,
    data: result,
  });
});

const deleteMySellerProfileFromDB = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await SellerProfileService.deleteMySellerProfileFromDB(userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Seller si deleted successfully',
    data: result,
  });
});

const reApplyForSellerIntoDB = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await SellerProfileService.reApplyForSellerIntoDB(userId, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Re apply for seller successfully',
    data: result,
  });
});

export const SellerProfileController = {
  applyForSellerIntoDB,
  updateMySellerProfileIntoDB,
  updateSellerStatusIntoDB,
  getAllSellerFromDB,
  getMySellerProfileFromDB,
  deleteMySellerProfileFromDB,
  reApplyForSellerIntoDB,
};
