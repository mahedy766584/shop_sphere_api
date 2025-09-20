import type { TJwtPayload } from '@interface/index.js';
import status from 'http-status';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

export const checkOwnership = (authUser: TJwtPayload, resourceOwnerId: string) => {
  if (authUser.role === 'superAdmin' || authUser.role === 'admin') {
    return;
  }

  if (authUser.role === 'customer' || authUser.role === 'seller') {
    if (authUser.userId !== resourceOwnerId) {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.NOT_ALLOWED);
    }
    return;
  }

  throw new AppError(status.UNAUTHORIZED, 'Unauthorized role');
};
