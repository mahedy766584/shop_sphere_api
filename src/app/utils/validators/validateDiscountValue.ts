import status from 'http-status';

import AppError from '@errors/appError.js';

export const validateDiscountValue = (
  type: 'flat' | 'percentage' | 'free_shipping' | 'bxgy',
  value?: number,
) => {
  if (type === 'percentage') {
    if (!value || value <= 0 || value > 100) {
      throw new AppError(status.BAD_REQUEST, 'Percentage discount must be between 1 and 100.');
    }
  }

  if (type === 'flat') {
    if (!value || value <= 0) {
      throw new AppError(status.BAD_REQUEST, 'Flat discount must be greater than 0.');
    }
  }

  if (type === 'free_shipping' || type === 'bxgy') {
    if (value) {
      throw new AppError(status.BAD_REQUEST, `${type} coupon should not have a discount value.`);
    }
  }
};
