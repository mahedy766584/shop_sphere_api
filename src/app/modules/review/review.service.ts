/* eslint-disable @typescript-eslint/no-explicit-any */
import AuditService from '@modules/auditLog/auditLog.service.js';
import { Order } from '@modules/order/order.model.js';
import type { Express } from 'express';
import status from 'http-status';
import { Types } from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { withTransaction } from '@utils/db/withTransaction.js';
import { uploadImageToCloudinary } from '@utils/file/sendImageToCloudinary.js';

import type { TReview } from './review.interface.js';
import { Review } from './review.model.js';

const createReviewIntoDB = async (
  files: Express.Multer.File[] | undefined,
  userId: string,
  userName: string,
  payload: TReview,
) => {
  return withTransaction(async (session) => {
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

    return review[0];
  });
};

const getProductReviews = async (productId: string) => {
  return await Review.find({ product: productId }).populate(
    'user',
    'userName name.firstName name.lastName profileImage',
  );
};

const getReviewById = async (reviewId: string) => {
  return await Review.findById(reviewId).populate(
    'user',
    'userName name.firstName name.lastName profileImage',
  );
};

const updateReview = async (
  userId: string,
  role: 'admin' | 'superAdmin',
  userName: string,
  reviewId: string,
  files: Express.Multer.File[] | undefined,
  payload: Partial<TReview>,
) => {
  const review = await Review.findOne({
    _id: reviewId,
    ...(role === 'admin' || role === 'superAdmin' ? {} : { user: userId }),
  });
  if (!review) throw new AppError(status.NOT_FOUND, ErrorMessages.REVIEW.NOT_FOUND);

  const allowedFields = ['rating', 'comment', 'images'];
  for (const key of Object.keys(payload) as (keyof TReview)[]) {
    if (!allowedFields.includes(key)) {
      delete payload[key];
    }
  }

  if (payload.rating && (payload.rating < 1 || payload.rating > 5)) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.REVIEW.INVALID_RATING);
  }

  if (files && files.length > 0) {
    const uploadedUrls = await uploadImageToCloudinary(files, userName);
    const existingImages = (payload.images ?? []) as string[];
    payload.images = [...existingImages, ...(uploadedUrls as string[])];
  }

  if (payload.rating) review.rating = payload.rating;
  if (payload.comment) review.comment = payload.comment;
  if (payload.images) review.images = payload.images;

  await review.save();
  return review;
};

const deleteReview = async (
  reviewId: string,
  userId: string,
  role: 'admin' | 'superAdmin' | 'customer',
) => {
  return withTransaction(async (session) => {
    const query: any = { _id: reviewId };
    if (role !== 'admin' && role !== 'superAdmin') {
      query.user = userId;
    }
    const review = await Review.findOne(query).session(session);
    if (!review) {
      throw new AppError(status.NOT_FOUND, ErrorMessages.REVIEW.NOT_FOUND);
    }

    if (role === 'customer' && review.user.toString() !== userId.toString()) {
      throw new AppError(status.FORBIDDEN, ErrorMessages.REVIEW.UNAUTHORIZED_DELETE);
    }

    const result = await Review.findByIdAndDelete(review._id).session(session);

    await AuditService.createFromDocs(
      {
        resourceType: 'CREATE_REVIEW',
        resourceId: reviewId,
        action: 'delete',
        performedBy: new Types.ObjectId(userId),
        previousData: review.toObject(),
        newData: null,
        meta: { shopId: review, sellerId: userId, role },
      },
      { session },
    );
    return result;
  });
};

const getProductReviewDetails = async (productId: string) => {
  const statsAndReviews = await Review.aggregate([
    { $match: { product: new Types.ObjectId(productId) } },

    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    { $unwind: '$userInfo' },

    {
      $project: {
        rating: 1,
        comment: 1,
        images: 1,
        createdAt: 1,
        'userInfo.userName': 1,
        'userInfo.name': 1,
        'userInfo.profileImage': 1,
      },
    },

    {
      $facet: {
        stats: [
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 },
            },
          },
        ],
        reviews: [{ $sort: { createdAt: -1 } }],
      },
    },
  ]);

  const stats = statsAndReviews[0]?.stats[0] || {
    avgRating: 0,
    totalReviews: 0,
  };

  const reviews = statsAndReviews[0]?.reviews || [];

  return { ...stats, reviews };
};

export const ReviewService = {
  createReviewIntoDB,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getProductReviewDetails,
};
