import AuditService from '@modules/auditLog/auditLog.service.js';
// import { NotificationService } from '@modules/notification/notification.service.js';
import NotificationService from '@modules/notification/notification.service.js';
import { SellerProfile } from '@modules/seller/seller.model.js';
import status from 'http-status';
import type { Types } from 'mongoose';
import mongoose from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { allowedFields } from './shop.constant.js';
import type { TShop } from './shop.interface.js';
import { Shop } from './shop.model.js';

const createShopIntoDB = async (userId: string, payload: TShop) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const seller = await SellerProfile.findOne({ user: userId }).session(session);
    if (!seller) {
      throw new AppError(status.NOT_FOUND, ErrorMessages.SELLER.NOT_FOUND);
    }
    if (!seller.isVerified) {
      throw new AppError(status.NOT_FOUND, ErrorMessages.SELLER.NOT_VERIFIED);
    }

    const [newShop] = await Shop.create([{ ...payload, owner: seller?._id, isActive: false }], {
      session,
    });

    if (!newShop) {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.SHOP.UPDATE_FAILED);
    }

    await AuditService.createFromDocs(
      {
        resourceType: 'Shop',
        resourceId: newShop._id,
        action: 'create',
        performedBy: userId,
        previousData: null,
        newData: newShop.toObject(),
        meta: null,
      },
      { session },
    );

    await session.commitTransaction();
    await session.endSession();

    return newShop;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const updateMyShopIntoDB = async (userId: string, shopId: string, payload: Partial<TShop>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingShop = await Shop.findById(shopId).session(session);
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

    const result = await Shop.findOneAndUpdate(
      { _id: shopId },
      { $set: payload },
      { new: true },
    ).session(session);

    if (!result) {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.SHOP.UPDATE_FAILED);
    }

    await AuditService.createFromDocs({
      resourceType: 'Shop',
      resourceId: result._id,
      action: 'update',
      performedBy: userId,
      previousData: null,
      newData: result.toObject(),
      meta: null,
    });

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const verifyShopIntoDB = async (
  shopId: string,
  isVerified: boolean,
  performedBy: string | Types.ObjectId,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const shop = await Shop.findByIdAndUpdate(shopId, { isVerified }, { new: true }).session(
      session,
    );
    if (!shop) {
      throw new AppError(status.FORBIDDEN, ErrorMessages.SHOP.NOT_FOUND);
    }

    await AuditService.createFromDocs(
      {
        resourceType: 'shop',
        resourceId: shopId,
        action: isVerified ? 'verify' : 'unVerify',
        performedBy,
        previousData: null,
        newData: shop,
        meta: { type: isVerified ? 'verify' : 'unVerify' },
      },
      { session },
    );

    // 🔹 Notification create
    if (isVerified) {
      await NotificationService.createForUser(
        {
          user: shop.owner,
          type: 'system',
          title: 'Shop Verification',
          message: 'Your shop has been successfully verified! 🎉',
          channels: ['in_app'],
          locale: 'en',
          priority: 'normal',
          dedupeKey: `shop-verify. name: ${shop.name}, id:${shop._id}`,
        },
        { session },
      );
    }

    await session.commitTransaction();
    await session.endSession();

    return shop;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
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
