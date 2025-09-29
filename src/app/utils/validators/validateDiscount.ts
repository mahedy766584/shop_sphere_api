import status from 'http-status';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

export const validateDiscount = (basePrice: number, discountPrice?: number) => {
  if (discountPrice !== undefined) {
    if (discountPrice >= basePrice) {
      throw new AppError(status.BAD_REQUEST, 'Discount must be less than the original price');
    }

    if (discountPrice > basePrice * 0.5) {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.PRODUCT.DISCOUNT);
    }
  }
};
