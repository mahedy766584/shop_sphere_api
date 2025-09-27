import type { TJwtPayload } from '@interface/index.js';
import { VerificationService } from '@modules/Auth/verification.service.js';
import type { Express } from 'express';
import status from 'http-status';
import mongoose from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { uploadImageToCloudinary } from '@utils/file/sendImageToCloudinary.js';

import type { TUser } from './user.interface.js';
import { User } from './user.model.js';
import { checkOwnership } from './user.utils.js';

const createUserIntoDB = async (file: Express.Multer.File | undefined, payload: TUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userExist = await User.isUserExistByUserName(payload?.userName);
    if (userExist) {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.USERNAME_EXIST);
    }

    if (file) {
      const imageUrl = await uploadImageToCloudinary(file, payload.userName);
      payload.profileImage = imageUrl as string;
    }
    const result = await User.create([payload], { session });
    await session.commitTransaction();
    session.endSession();

    await VerificationService.sendVerificationEmail(result[0]._id, result[0].email);

    return result[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllUserFromDB = async () => {
  const result = await User.find();
  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const result = await User.findById(id);
  return result;
};

const updateMyProfile = async (authUser: TJwtPayload, payload: Partial<TUser>) => {
  return updateSingleUser(authUser.userId, authUser, payload);
};

const updateSingleUser = async (userId: string, authUser: TJwtPayload, payload: Partial<TUser>) => {
  const userExist = await User.findById(userId);
  if (!userExist) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.NOT_EXISTS);
  }
  if (userExist.status !== 'active') {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.INACTIVE);
  }
  if (userExist.isBanned) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.BANNED);
  }
  if (userExist.isDeleted) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.DELETED);
  }
  //2️⃣ Owner validation
  checkOwnership(authUser, userExist._id.toString());

  const { name, address, ...remainingUserDAte } = payload;

  const modifiedUpdateData: Record<string, unknown> = {
    ...remainingUserDAte,
  };

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdateData[`name.${key}`] = value;
    }
  }

  if (address && Object.keys(address).length) {
    for (const [key, value] of Object.entries(address)) {
      modifiedUpdateData[`address.${key}`] = value;
    }
  }

  const result = await User.findByIdAndUpdate(userId, modifiedUpdateData, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.NOT_FOUND);
  }

  return result;
};

const getMyProfile = async (authUser: TJwtPayload) => {
  const result = await User.findById(authUser.userId).select('-password');
  if (!result) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.USER.NOT_FOUND);
  }
  return result;
};

export const UserService = {
  createUserIntoDB,
  getAllUserFromDB,
  getSingleUserFromDB,
  updateSingleUser,
  getMyProfile,
  updateMyProfile,
};
