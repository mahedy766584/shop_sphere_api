import { Order } from '@modules/order/order.model.js';
import type { Express } from 'express';
import status from 'http-status';
import mongoose from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { uploadImageToCloudinary } from '@utils/file/sendImageToCloudinary.js';

import type { TReview } from './review.interface.js';
import { Review } from './review.model.js';

const createReviewIntoDB = async (
  files: Express.Multer.File[] | undefined,
  userId: string,
  userName: string,
  payload: TReview,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const hasOrder = await Order.exists({
      user: userId,
      product: payload?.product,
      status: 'delivered',
    }).session(session);

    const alreadyReviewed = await Review.findOne({
      user: userId,
      product: payload.product,
    }).session(session);
    if (alreadyReviewed) throw new AppError(status.BAD_REQUEST, ErrorMessages.REVIEW.REVIEWED);

    if (files && files.length > 0) {
      const imageUrls = await uploadImageToCloudinary(files, userName);
      payload.images = imageUrls as string[];
    }

    const review = await Review.create(
      [
        {
          ...payload,
          user: userId,
          isVerifiedPurchase: Boolean(hasOrder),
        },
      ],
      { session },
    );

    await session.commitTransaction();
    await session.endSession();

    return review[0];
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const getProductReviews = async (productId: string) => {
  return await Review.find({ product: productId }).populate(
    'user',
    'userName name.firstName name.lastName',
  );
};

export const ReviewService = {
  createReviewIntoDB,
  getProductReviews,
};
