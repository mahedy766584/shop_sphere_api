import { Shop } from '@modules/shop/shop.model.js';
import status from 'http-status';
import type { ClientSession, Types } from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

export const checkShopOwnership = async (
  shopId: string,
  userId: string | Types.ObjectId,
  session?: ClientSession,
) => {
  const shop = await Shop.findById(shopId).session(session || null);

  if (!shop) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.SHOP.NOT_FOUND);
  }

  if (shop.owner.toString() !== userId.toString()) {
    throw new AppError(status.FORBIDDEN, ErrorMessages.SHOP.NOT_OWNER);
  }

  if (!shop.isActive) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.SHOP.NOT_ACTIVE);
  }

  if (!shop.isVerified) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.SHOP.NOT_VERIFIED);
  }

  if (shop.isDeleted) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.SHOP.DELETED);
  }

  return shop;
};
