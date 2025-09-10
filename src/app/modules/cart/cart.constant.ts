/* eslint-disable @typescript-eslint/no-explicit-any */

import { Product } from '@modules/products/products.model.js';
import status from 'http-status';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

// helper: calculate totals (runtime)
export const calculateTotals = (items: any[]) => {
  let beforeDiscountTotal = 0;
  let totalAmount = 0;

  for (const item of items) {
    beforeDiscountTotal += item.originalPrice * item.quantity;
    totalAmount += item.priceAtAddTime * item.quantity;
  }

  const discountTotal = beforeDiscountTotal - totalAmount;

  return { beforeDiscountTotal, discountTotal, totalAmount };
};

// validate product
export const validateProduct = async (productId: string, quantity: number) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

  if (!product.isActive || product.isDeleted) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.PRODUCT.DELETED);
  }

  if (quantity > product.stock) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.PRODUCT.QUANTITY_EXCEEDS(product.stock));
  }

  const priceToUse =
    product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;

  return { product, priceToUse };
};
