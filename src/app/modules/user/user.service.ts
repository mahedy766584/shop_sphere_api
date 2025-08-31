/* eslint-disable @typescript-eslint/no-explicit-any */
import status from 'http-status';
import mongoose from 'mongoose';

import AppError from '@errors/appError.js';

import { uploadImageToCloudinary } from '@utils/sendImageToCloudinary.js';

import type { TUser } from './user.interface.js';
import { User } from './user.model.js';

const createUserIntoDB = async (file: any, payload: TUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userExist = await User.isUserExistByUserName(payload?.userName);
    if (userExist) {
      throw new AppError(status.BAD_REQUEST, 'User already exists with this user name');
    }

    if (file) {
      const imageName = `${payload.userName}`;
      const path = file?.path;
      const { secure_url } = await uploadImageToCloudinary(imageName, path);
      payload.profileImage = secure_url;
    }
    const result = await User.create([payload], { session });
    await session.commitTransaction();
    session.endSession();

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
