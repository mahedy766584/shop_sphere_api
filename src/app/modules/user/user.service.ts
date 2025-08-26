import status from 'http-status';

import AppError from '../../errors/appError.js';

import type { TUser } from './user.interface.js';
import { User } from './user.model.js';

const createUserIntoDB = async (payload: TUser) => {
  const userExist = await User.isUserExistByUserName(payload?.userName);
  if (userExist) {
    throw new AppError(status.BAD_REQUEST, 'User already exists with this user name');
  }

  const result = await User.create(payload);

  return result;
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
