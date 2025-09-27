import status from 'http-status';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

import { ProductDiscountService } from './discount.service.js';

const createProductDiscountIntoDB = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await ProductDiscountService.createProductDiscountIntoDB(userId, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Discount has been created successfully and is now active for this product.',
    data: result,
  });
});

const updateProductDiscount = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { discountId } = req.params;
  const result = await ProductDiscountService.updateProductDiscount(userId, discountId, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product discount updated successfully.',
    data: result,
  });
});

const deleteProductDiscount = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { discountId } = req.params;
  const result = await ProductDiscountService.deleteProductDiscount(userId, discountId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product discount deleted successfully.',
    data: result,
  });
});

const getAllDiscounts = catchAsync(async (req, res) => {
  const result = await ProductDiscountService.getAllDiscounts();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product discount retrieved successfully.',
    data: result,
  });
});

const getDiscountById = catchAsync(async (req, res) => {
  const { discountId } = req.params;
  const result = await ProductDiscountService.getDiscountById(discountId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product discount retrieved successfully.',
    data: result,
  });
});

const getDiscountsByProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const result = await ProductDiscountService.getDiscountsByProduct(productId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Discount product retrieved successfully.',
    data: result,
  });
});

const setDiscountActiveStatus = catchAsync(async (req, res) => {
  const { discountId } = req.params;
  const { isActive } = req.body;

  const result = await ProductDiscountService.setDiscountActiveStatus(discountId, isActive);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `Discount ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: result,
  });
});

const syncProductDiscountPrice = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const result = await ProductDiscountService.syncProductDiscountPrice(productId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Product discount retrieved successfully.',
    data: result,
  });
});

const getTopDiscountedProducts = catchAsync(async (req, res) => {
  const result = await ProductDiscountService.getTopDiscountedProducts();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Top discount products retrieved successfully.',
    data: result,
  });
});

export const ProductDiscountController = {
  createProductDiscountIntoDB,
  updateProductDiscount,
  deleteProductDiscount,
  getAllDiscounts,
  getDiscountById,
  getDiscountsByProduct,
  setDiscountActiveStatus,
  syncProductDiscountPrice,
  getTopDiscountedProducts,
};
