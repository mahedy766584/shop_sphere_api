import { SellerProfile } from '@modules/seller/seller.model.js';
import status from 'http-status';
import type { ClientSession } from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

export const checkSellerProfile = async (userId: string, session?: ClientSession) => {
  const seller = await SellerProfile.findOne({ user: userId }).session(session || null);

  if (!seller) {
    throw new AppError(status.FORBIDDEN, ErrorMessages.SELLER.NOT_FOUND);
  }

  if (seller) {
    if (seller.status === 'pending') {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.SELLER.ALREADY_PENDING);
    }
    if (seller.status === 'approved') {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.SELLER.ALREADY_APPROVED);
    }
    if (seller.status === 'rejected') {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.SELLER.ALREADY_REJECTED);
    }
  }

  return seller;
};
