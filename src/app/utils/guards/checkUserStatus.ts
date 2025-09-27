import { User } from '@modules/user/user.model.js';
import status from 'http-status';
import type { ClientSession } from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

export const checkUserStatus = async (userId: string, session?: ClientSession) => {
  const user = await User.findById(userId).session(session || null);

  if (!user) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.USER.NOT_FOUND);
  }

  if (user.isDeleted) {
    throw new AppError(status.FORBIDDEN, ErrorMessages.USER.DELETED);
  }

  if (user.isBanned) {
    throw new AppError(status.FORBIDDEN, ErrorMessages.USER.BANNED);
  }

  if (!user.isEmailVerified) {
    throw new AppError(status.FORBIDDEN, ErrorMessages.SELLER.NOT_VERIFIED);
  }

  return user;
};
