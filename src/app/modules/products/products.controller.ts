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

const softDeleteProductFromDB = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;
  const result = await ProductService.softDeleteProductFromDB(productId, userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product is deleted successfully',
    data: result,
  });
});

const restoreProductIntoDB = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;
  const result = await ProductService.restoreProductIntoDB(userId, productId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product is restored successfully',
    data: result,
  });
});

const updateProductStock = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;
  const { stock } = req.body;
  const result = await ProductService.updateProductStock(userId, productId, stock);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product is incremented successfully',
    data: result,
  });
});

const getProductByShopFromDB = catchAsync(async (req, res) => {
  const { shopId } = req.params;
  const { result, meta } = await ProductService.getProductByShopFromDB(shopId, req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Your product is retrieved successfully',
    meta: meta,
    data: result,
  });
});

const toggleProductStatus = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;
  const result = await ProductService.toggleProductStatus(userId, productId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `You changed product status successfully. Current status: ${result?.isActive ? 'Active' : 'Inactive'}`,
    data: result,
  });
});

const toggleProductFeatures = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;
  const result = await ProductService.toggleProductFeatures(userId, productId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `Product has been ${result?.isFeatured ? 'marked as Featured' : 'removed from Featured'} successfully.`,
    data: result,
  });
});

export const ProductController = {
  createProductIntoDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  updateProductIntoDB,
  softDeleteProductFromDB,
  restoreProductIntoDB,
  updateProductStock,
  getProductByShopFromDB,
  toggleProductStatus,
  toggleProductFeatures,
};
