import type { Express } from 'express';
import status from 'http-status';

import { SuccessMessages } from '@constants/successMessages.js';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

import { ProductService } from './products.service.js';

const createProductIntoDB = catchAsync(async (req, res) => {
  const { userId, role } = req.user;
  const { shopId } = req.params;
  const result = await ProductService.createProductIntoDB(
    req.files as Express.Multer.File[],
    shopId,
    userId,
    role as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.PRODUCT.CREATED,
    data: result,
  });
});

const getAllProductsFromDB = catchAsync(async (req, res) => {
  const { result, meta } = await ProductService.getAllProductsFromDB(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Products is retrieved successfully',
    meta: meta,
    data: result,
  });
});

const getSingleProductFromDB = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const result = await ProductService.getSingleProductFromDB(productId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product is retrieved successfully',
    data: result,
  });
});

const updateProductIntoDB = catchAsync(async (req, res) => {
  const { userId, role } = req.user;
  const { productId } = req.params;

  const result = await ProductService.updateProductIntoDB(
    productId,
    userId,
    role as string,
    req.files as Express.Multer.File[] | undefined,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product is updated successfully',
    data: result,
  });
});

export const ProductController = {
  createProductIntoDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  updateProductIntoDB,
};
