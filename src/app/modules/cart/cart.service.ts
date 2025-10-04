import status from 'http-status';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { checkProductStatus } from '@utils/guards/checkProductStatus.js';
import { checkUserStatus } from '@utils/guards/checkUserStatus.js';

import type { TCart } from './cart.interface.js';
import { Cart } from './cart.model.js';

const addProductInCart = async (userId: string, payload: TCart) => {
  const user = await checkUserStatus(userId);
  const product = await checkProductStatus(payload.product.toString());

  const existCart = await Cart.findOne({ product: product?._id, user: user?._id });

  if (existCart) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.CART.EXISTS);
  }

  if (payload.quantity && payload.quantity < 0) {
    throw new AppError(status.BAD_REQUEST, 'Quantity is must be gather then 0');
  }

  const priceAtAddTime = product.price;
  const totalPrice = payload?.quantity ? priceAtAddTime * payload.quantity : priceAtAddTime;

  const result = await Cart.create({
    ...payload,
    user: user._id,
    priceAtAddTime,
    quantity: payload.quantity || 1,
    totalAmount: totalPrice,
  });

  return result;
};

const getUserCart = async (userId: string) => {
  const user = await checkUserStatus(userId);
  const result = await Cart.find({ user: user._id })
    .populate('user', 'userName name.firstName name.lastName')
    .populate('product');
  return { totalCart: result.length, result };
};

const updateCartQuantity = async (userId: string, cartId: string, quantity: number) => {
  const user = await checkUserStatus(userId);

  const cart = await Cart.findOne({ _id: cartId, user: user });

  if (!cart) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.CART.NOT_FOUND);
  }

  cart.quantity = quantity;
  cart.totalAmount = cart.priceAtAddTime * quantity;

  await cart.save();

  return cart;
};

const deleteSingleCart = async (cartId: string, userId: string) => {
  const user = await checkUserStatus(userId);

  const cart = await Cart.findOne({ _id: cartId, user: user });

  if (!cart) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.CART.NOT_FOUND);
  }

  const result = await Cart.findByIdAndDelete(cartId);
  return result;
};

export const CartService = {
  addProductInCart,
  getUserCart,
  updateCartQuantity,
  deleteSingleCart,
};
