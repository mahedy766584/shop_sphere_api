import { Product } from '@modules/products/products.model.js';
import status from 'http-status';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import type { TItems } from './cart.interface.js';

const calculateTotal = (items: TItems[]): number => {
  return items.reduce((acc, item) => acc + item.quantity * item.priceAtAddTime, 0);
};

const validateProduct = async (productId: string, quantity: number) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

  if (!product.isActive || product.isDeleted)
    throw new AppError(status.BAD_REQUEST, ErrorMessages.PRODUCT.DELETED);

  if (quantity > product.stock)
    throw new AppError(status.BAD_REQUEST, ErrorMessages.PRODUCT.AVAILABLE(product.stock));

  return product;
};

const addItemToCart = async (userId: string, item: TItems) => {
  console.log(userId)
};
