import { SellerProfile } from '@modules/seller/seller.model.js';
import status from 'http-status';
import type { ClientSession } from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

export const checkSellerStatus = async (userId: string, session?: ClientSession) => {
  const sellerExist = await SellerProfile.findOne({ user: userId }).session(session || null);
  if (sellerExist) {
    if (sellerExist.status === 'pending') {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.SELLER.ALREADY_PENDING);
    }
    if (sellerExist.status === 'approved') {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.SELLER.ALREADY_APPROVED);
    }
    if (sellerExist.status === 'rejected') {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.SELLER.ALREADY_REJECTED);
    }
  }
};
