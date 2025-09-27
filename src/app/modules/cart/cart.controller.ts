import status from 'http-status';

import { SuccessMessages } from '@constants/successMessages.js';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

import { CartService } from './cart.service.js';

const addItemToCart = catchAsync(async (req, res) => {
  const { userId } = req.user;
  let { items } = req.body;

  // Normalize single object to array
  if (!Array.isArray(items)) items = [items];

  const result = await CartService.addItemToCart(userId, items);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.CART.ADDED,
    data: result,
  });
});

const removeItemCartQuantity = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const { productId, quantity } = req.body;

  const result = await CartService.removeItemCartQuantity(userId, productId, quantity);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: quantity === 0 ? SuccessMessages.CART.ITEM_REMOVE : SuccessMessages.CART.ITEM_UPDATE,
    data: result,
  });
});

const removeItemFromCart = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.params;
  const result = await CartService.removeItemFromCart(userId, productId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.CART.ITEM_REMOVE,
    data: result,
  });
});

const getMyCart = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await CartService.getMyCart(userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.CART.CART_RETRIEVED,
    data: result,
  });
});

const clearCart = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await CartService.clearCart(userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.CART.CART_CLEAR,
    data: result,
  });
});

export const CartController = {
  addItemToCart,
  removeItemCartQuantity,
  removeItemFromCart,
  getMyCart,
  clearCart,
};
