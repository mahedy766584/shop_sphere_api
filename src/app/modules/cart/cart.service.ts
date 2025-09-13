/* eslint-disable @typescript-eslint/no-explicit-any */
import { redlock } from '@shared/redlock.js';
import status from 'http-status';
import { Types } from 'mongoose';
import type { Lock } from 'redlock';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { calculateTotals, validateProduct } from './cart.constant.js';
import { Cart } from './cart.model.js';

// add / update cart
const addItemToCart = async (userId: string, items: { product: string; quantity: number }[]) => {
  const lockKey = `lock:cart:${userId}`;
  let lock: Lock | undefined;

  try {
    lock = await redlock.acquire([lockKey], 2000);

    const itemsArray = Array.isArray(items) ? items : [items];

    let cart = await Cart.findOne({ user: new Types.ObjectId(userId) });

    if (!cart) {
      const newItems = [];
      for (const item of itemsArray) {
        const { product, priceToUse } = await validateProduct(item.product, item.quantity);
        newItems.push({
          product: product._id,
          quantity: item.quantity,
          originalPrice: product.price,
          priceAtAddTime: priceToUse,
        });
      }

      cart = await Cart.create({
        user: new Types.ObjectId(userId),
        items: newItems,
      });
    } else {
      for (const item of itemsArray) {
        const { product, priceToUse } = await validateProduct(item.product, item.quantity);

        const cartExisting = cart.items.find(
          (i: any) => i.product.toString() === product._id.toString(),
        );

        if (cartExisting) {
          if (cartExisting.quantity + item.quantity > product.stock) {
            throw new AppError(
              status.BAD_REQUEST,
              ErrorMessages.PRODUCT.QUANTITY_EXCEEDS(product.stock),
            );
          }
          cartExisting.quantity += item.quantity;
          cartExisting.originalPrice = product.price;
          cartExisting.priceAtAddTime = priceToUse;
        } else {
          cart.items.push({
            product: product._id,
            quantity: item.quantity,
            originalPrice: product.price,
            priceAtAddTime: priceToUse,
          });
        }
      }

      await cart.save();
    }

    // ✅ runtime এ totals হিসাব করা হচ্ছে
    const { beforeDiscountTotal, discountTotal, totalAmount } = calculateTotals(cart.items);

    return {
      user: cart.user,
      items: cart.items,
      beforeDiscountTotal,
      discountTotal,
      totalAmount,
    };
  } finally {
    if (lock) await (lock as any).release();
  }
};

const removeItemCartQuantity = async (userId: string, productId: string, newQuantity: number) => {
  const lockKey = `lock:cart:${userId}`;
  let lock: Lock | undefined;

  try {
    lock = await redlock.acquire([lockKey], 2000);

    const cart = await Cart.findOne({ user: new Types.ObjectId(userId) });

    if (!cart) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

    const item = cart.items.find((i: any) => i.product.toString() === productId);
    if (!item) throw new AppError(status.NOT_FOUND, 'Item not in cart');

    if (newQuantity === 0) {
      cart.items = cart.items.filter((i: any) => i.product.toString() !== productId);
    } else {
      const { product, priceToUse } = await validateProduct(productId, newQuantity);
      if (newQuantity > product.stock) {
        throw new AppError(status.BAD_REQUEST, ErrorMessages.PRODUCT.AVAILABLE(product.stock));
      }

      item.quantity = newQuantity;
      item.originalPrice = product.price;
      item.priceAtAddTime = priceToUse;
    }

    await cart.save();

    const { beforeDiscountTotal, discountTotal, totalAmount } = calculateTotals(cart.items);

    return {
      user: cart.user,
      item: cart.items,
      beforeDiscountTotal,
      discountTotal,
      totalAmount,
    };
  } finally {
    if (lock) await (lock as any).release();
  }
};

const removeItemFromCart = async (userId: string, productId: string) => {
  return removeItemCartQuantity(userId, productId, 0);
};

const getMyCart = async (userId: string) => {
  return await Cart.findOne({ user: userId }).populate('items.product');
};

const clearCart = async (userId: string) => {
  return await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: [], totalAmount: 0 } },
    { new: true },
  );
};

export const CartService = {
  addItemToCart,
  removeItemCartQuantity,
  removeItemFromCart,
  getMyCart,
  clearCart,
};
