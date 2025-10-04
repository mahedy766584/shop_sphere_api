import status from 'http-status';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

import { CartService } from './cart.service.js';

const addProductInCart = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await CartService.addProductInCart(userId, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product added successfully',
    data: result,
  });
});

const getUserCart = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await CartService.getUserCart(userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Cart ite is retrieved successfully',
    data: result,
  });
});

const updateCartQuantity = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { cartId } = req.params;
  const { quantity } = req.body;
  const result = await CartService.updateCartQuantity(userId, cartId, quantity);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Cart quantity is updated successfully',
    data: result,
  });
});

const deleteSingleCart = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { cartId } = req.params;
  const result = await CartService.deleteSingleCart(cartId, userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Cart is deleted successfully',
    data: result,
  });
});

export const CartController = {
  addProductInCart,
  getUserCart,
  updateCartQuantity,
  deleteSingleCart,
};
