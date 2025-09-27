import type { Express } from 'express';
import status from 'http-status';

import { SuccessMessages } from '@constants/successMessages.js';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

import { ProductService } from './products.service.js';

const createProductIntoDB = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { shopId } = req.params;
  const result = await ProductService.createProductIntoDB(
    req.files as Express.Multer.File[],
    shopId,
    userId,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.PRODUCT.CREATED,
    data: result,
  });
});

export const ProductController = {
  createProductIntoDB,
};
