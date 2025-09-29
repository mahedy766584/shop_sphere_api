import status from 'http-status';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

export const validateAllowedAttributes = (
  attributes: { key: string; value: string[] }[] | undefined,
  allowed: string[],
) => {
  attributes?.forEach((attr) => {
    if (!allowed.includes(attr.key)) {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.PRODUCT.NOT_ALLOWED_ATTRIBUTE(attr.key));
    }
  });
};
