import { User } from '@modules/user/user.model.js';
import status from 'http-status';
import mongoose from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import type { TStatus } from './seller.constant.js';
import { allowedFields } from './seller.constant.js';
import type { TSellerProfile } from './seller.interface.js';
import { SellerProfile } from './seller.model.js';

const applyForSellerIntoDB = async (userId: string, payload: TSellerProfile) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.USER.NOT_FOUND);
  }
  if (user?.role !== 'customer') {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.SELLER.ONLY_CUSTOMER_CAN_APPLY);
  }
  if (!user?.isEmailVerified) {
    throw new AppError(status.FORBIDDEN, ErrorMessages.USER.EMAIL_VERIFICATION_REQUIRED);
  }

  const sellerExist = await SellerProfile.findOne({ user: userId });
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

  const result = await SellerProfile.create({ ...payload, user: userId, status: 'pending' });
  return result;
};

const updateMySellerProfileIntoDB = async (userId: string, payload: Partial<TSellerProfile>) => {
  Object.keys(payload).forEach((key) => {
    if (!allowedFields.includes(key)) {
      throw new AppError(status.FORBIDDEN, ErrorMessages.VALIDATION.NOT_ALLOWED(key));
    }
  });
  const seller = await SellerProfile.findOneAndUpdate(
    { user: userId },
    { $set: payload },
    { new: true },
  );
  if (!seller) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.SELLER.NOT_FOUND);
  }
  return seller;
};

const updateSellerStatusIntoDB = async (sellerId: string, newStatus: TStatus) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const seller = await SellerProfile.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(sellerId) },
      { $set: { status: newStatus, isVerified: true } },
      { new: true, session },
    );

    if (!seller) {
      throw new AppError(status.NOT_FOUND, ErrorMessages.SELLER.NOT_FOUND);
    }

    if (newStatus === ('approved' as TStatus)) {
      await User.findByIdAndUpdate(
        seller.user,
        { $set: { role: 'seller' } },
        { new: true, session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    return seller;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const getAllSellerFromDB = async () => {
  const result = await SellerProfile.find().populate('user', 'name email role');
  return result;
};

export const SellerProfileService = {
  applyForSellerIntoDB,
  updateMySellerProfileIntoDB,
  updateSellerStatusIntoDB,
  getAllSellerFromDB,
};
