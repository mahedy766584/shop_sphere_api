import status from 'http-status';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

import { CategoryService } from './category.service.js';

const createCategoryIntoDB = catchAsync(async (req, res) => {
  const result = await CategoryService.createCategoryIntoDB(req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Category is created successfully',
    data: result,
  });
});

const getAllCategories = catchAsync(async (req, res) => {
  const result = await CategoryService.getAllCategories();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Categories is retrieved successfully',
    data: result,
  });
});

const getSingleCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryService.getSingleCategory(id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Category is retrieved successfully',
    data: result,
  });
});

const getActiveCategories = catchAsync(async (req, res) => {
  const result = await CategoryService.getActiveCategories();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Category is retrieved successfully',
    data: result,
  });
});

const getChildCategories = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryService.getChildCategories(id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Category is retrieved successfully',
    data: result,
  });
});

const buildCategoryTree = catchAsync(async (req, res) => {
  const result = await CategoryService.buildCategoryTree();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Category tree retrieved successfully',
    data: result,
  });
});

const updateSingleCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryService.updateSingleCategory(id, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Category is updated successfully',
    data: result,
  });
});

const toggleCategoryStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryService.toggleCategoryStatus(id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Category is updated successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryService.deleteCategory(id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Category is deleted successfully',
    data: result,
  });
});

export const CategoryController = {
  createCategoryIntoDB,
  getAllCategories,
  getSingleCategory,
  updateSingleCategory,
  deleteCategory,
  getActiveCategories,
  getChildCategories,
  toggleCategoryStatus,
  buildCategoryTree,
};
