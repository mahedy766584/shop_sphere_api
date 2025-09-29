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

  return seller;
};

export const ensureSellerStatus = (seller: { status: string }, allowed: string[]) => {
  if (!allowed.includes(seller.status)) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.SELLER.NOT_VERIFIED);
  }
};
