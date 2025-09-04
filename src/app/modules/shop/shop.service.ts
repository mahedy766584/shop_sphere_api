import { SellerProfile } from '@modules/seller/seller.model.js';
import status from 'http-status';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { allowedFields } from './shop.constant.js';
import type { TShop } from './shop.interface.js';
import { Shop } from './shop.model.js';

const createShopIntoDB = async (userId: string, payload: TShop) => {
  const seller = await SellerProfile.findOne({ user: userId });
  if (!seller) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.SELLER.NOT_FOUND);
  }
  if (!seller.isVerified) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.SELLER.NOT_VERIFIED);
  }
  const newShop = await Shop.create({ ...payload, owner: seller?._id });
  return newShop;
};

const updateMyShopIntoDB = async (shopId: string, payload: Partial<TShop>) => {
  const existingShop = await Shop.findById(shopId);
  if (!existingShop) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.SHOP.NOT_FOUND);
  }

  const existingSeller = await SellerProfile.findOne({ _id: existingShop.owner });
  if (!existingSeller) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.SHOP.UPDATE_FAILED);
  }

  Object.keys(payload).forEach((key) => {
    if (!allowedFields.includes(key)) {
      throw new AppError(status.FORBIDDEN, ErrorMessages.VALIDATION.NOT_ALLOWED(key));
    }
  });

  const result = await Shop.findOneAndUpdate({ _id: shopId }, { $set: payload }, { new: true });
  return result;
};

const verifyShopIntoDB = async (shopId: string, isVerified: boolean) => {
  const shop = await Shop.findByIdAndUpdate(shopId, { isVerified }, { new: true });
  if (!shop) {
    throw new AppError(status.FORBIDDEN, ErrorMessages.SHOP.NOT_FOUND);
  }
  return shop;
};

const getAllShop = async () => {
  const result = await Shop.find().populate({
    path: 'owner',
    populate: {
      path: 'user',
      model: 'User',
      select: 'name email role',
    },
  });
  return result;
};

const getShopAsOwner = async (sellerId: string) => {
  const owner = await Shop.findOne({ owner: sellerId }).populate({
    path: 'owner',
    populate: {
      path: 'user',
      model: 'User',
      select: 'name email role',
    },
  });
  if (!owner) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.SHOP.NOT_FOUND);
  }
  return owner;
};

export const ShopService = {
  createShopIntoDB,
  updateMyShopIntoDB,
  verifyShopIntoDB,
  getAllShop,
  getShopAsOwner,
};
