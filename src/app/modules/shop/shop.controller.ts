import status from 'http-status';

import { SuccessMessages } from '@constants/successMessages.js';

import catchAsync from '@utils/catchAsync.js';
import sendResponse from '@utils/sendResponse.js';

import { ShopService } from './shop.service.js';

const createShopIntoDB = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await ShopService.createShopIntoDB(userId, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.SHOP.CREATED,
    data: result,
  });
});

const updateMyShopIntoDB = catchAsync(async (req, res) => {
  const { shopId } = req.params;
  const { userId } = req.user;
  const result = await ShopService.updateMyShopIntoDB(userId, shopId, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.SHOP.UPDATED,
    data: result,
  });
});

const verifyShopIntoDB = catchAsync(async (req, res) => {
  const { shopId } = req.params;
  const { isVerified } = req.body;
  const { userId } = req.user;
  const result = await ShopService.verifyShopIntoDB(shopId, isVerified, userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.SHOP.VERIFIED_SUCCESS,
    data: result,
  });
});

const getAllShop = catchAsync(async (req, res) => {
  const result = await ShopService.getAllShop();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.SHOP.RETRIEVED,
    data: result,
  });
});

const getShopAsOwner = catchAsync(async (req, res) => {
  const { sellerId } = req.params;
  const result = await ShopService.getShopAsOwner(sellerId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.SHOP.RETRIEVED,
    data: result,
  });
});

export const ShopController = {
  createShopIntoDB,
  updateMyShopIntoDB,
  verifyShopIntoDB,
  getAllShop,
  getShopAsOwner,
};
