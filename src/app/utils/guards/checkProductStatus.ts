import { Product } from '@modules/products/products.model.js';
import status from 'http-status';
import type { ClientSession } from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

export const checkProductStatus = async (productId: string, session?: ClientSession) => {
  const product = await Product.findById(productId).session(session || null);
  if (!product) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);
  }

  if (!product.isActive) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_ACTIVE);
  }

  if (product.isDeleted) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.DELETED);
  }
  return product;
};
