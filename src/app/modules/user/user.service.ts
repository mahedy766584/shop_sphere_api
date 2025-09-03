import { VerificationService } from '@modules/Auth/verification.service.js';
import type { Express } from 'express';
import status from 'http-status';
import mongoose from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { uploadImageToCloudinary } from '@utils/sendImageToCloudinary.js';

import type { TUser } from './user.interface.js';
import { User } from './user.model.js';

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

export const UserService = {
  createUserIntoDB,
  getAllUserFromDB,
  getSingleUserFromDB,
};
