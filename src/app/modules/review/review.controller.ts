import type { Express } from 'express';
import status from 'http-status';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

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

const getReviewById = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const result = await ReviewService.getReviewById(reviewId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Review is retrieved successfully',
    data: result,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const { userId, userName, role } = req.user;
  const result = await ReviewService.updateReview(
    userId,
    role as 'admin' | 'superAdmin',
    userName as string,
    reviewId,
    req.files as Express.Multer.File[] | undefined,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Review is update successfully',
    data: result,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const { userId, role } = req.user;
  const result = await ReviewService.deleteReview(
    reviewId,
    userId,
    role as 'admin' | 'superAdmin' | 'customer',
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Review is deleted successfully',
    data: result,
  });
});

const getProductReviewDetails = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const result = await ReviewService.getProductReviewDetails(productId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Review adn average rating is retrieved successfully',
    data: result,
  });
});

export const ReviewController = {
  createReviewIntoDB,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getProductReviewDetails,
};
