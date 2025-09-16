import type { Express } from 'express';
import status from 'http-status';

import catchAsync from '@utils/catchAsync.js';
import sendResponse from '@utils/sendResponse.js';

import { ReviewService } from './review.service.js';

const createReviewIntoDB = catchAsync(async (req, res) => {
  const { userId, userName } = req.user;
  const result = await ReviewService.createReviewIntoDB(
    req.files as Express.Multer.File[],
    userId,
    userName as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
});

const getProductReviews = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const result = await ReviewService.getProductReviews(productId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Review is retrieved successfully',
    data: result,
  });
});

export const ReviewController = {
  createReviewIntoDB,
  getProductReviews,
};
