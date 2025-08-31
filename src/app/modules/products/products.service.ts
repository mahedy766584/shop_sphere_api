import { User } from '@modules/user/user.model.js';
import status from 'http-status';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import type { TProduct } from './products.interface.js';

const createProductIntoDB = async (userId: string, payload: TProduct) => {
  const userExist = await User.findById(userId);

  if (!userExist) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.USER.NOT_FOUND);
  }
  if (userExist.isBanned) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.USER.BANNED);
  }
  if(userExist.isDeleted){
    throw new AppError(status.NOT_FOUND, ErrorMessages.USER.DELETED);
  }
};

export const ProductService = {
  createProductIntoDB,
};
