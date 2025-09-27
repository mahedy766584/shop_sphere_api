import { Shop } from '@modules/shop/shop.model.js';
import status from 'http-status';
import type { ClientSession } from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

export const checkShopOwnership = async (
  shopId: string,
  sellerId: string,
  session?: ClientSession,
) => {
  const shop = await Shop.findById(shopId).session(session || null);

  if (!shop) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.SHOP.NOT_FOUND);
  }

  if (shop.owner.toString() !== sellerId.toString()) {
    throw new AppError(status.FORBIDDEN, ErrorMessages.SHOP.NOT_OWNER);
  }

  return shop;
};
