import status from 'http-status';

import { SuccessMessages } from '@constants/successMessages.js';

import catchAsync from '@utils/catchAsync.js';
import sendResponse from '@utils/sendResponse.js';

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
  const result = await SellerProfileService.getAllSellerFromDB();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.SELLER.RETRIEVED,
    data: result,
  });
});

export const SellerProfileController = {
  applyForSellerIntoDB,
  updateMySellerProfileIntoDB,
  updateSellerStatusIntoDB,
  getAllSellerFromDB,
};
