/* eslint-disable @typescript-eslint/no-explicit-any */
import status from 'http-status';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import type { TCategory } from './category.interface.js';
import { Category } from './category.model.js';

const createCategoryIntoDB = async (payload: TCategory) => {
  const category = await Category.findOne({ name: payload.name });
  if (category) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.CATEGORY.EXISTING);
  }
  const result = (await Category.create(payload)).populate('parent');
  return result;
};

const getAllCategories = async () => {
  const result = await Category.find().populate({
    path: 'parent',
    populate: {
      path: 'parent',
      model: 'Category',
    },
  });
  return result;
};

const getSingleCategory = async (id: string) => {
  const result = await Category.findById(id).populate({
    path: 'parent',
    populate: {
      path: 'parent',
      model: 'Category',
    },
  });
  return result;
};

const getActiveCategories = async () => {
  return Category.find({ isActive: true }).populate({
    path: 'parent',
    populate: {
      path: 'parent',
      model: 'Category',
    },
  });
};

const getChildCategories = async (parentId: string) => {
  return Category.find({ parent: parentId }).populate({
    path: 'parent',
    populate: {
      path: 'parent',
      model: 'Category',
    },
  });
};

const buildCategoryTree = async () => {
  const categories = await Category.find().populate({
    path: 'parent',
    select: 'name slug',
  });

  const map: Record<string, any> = {};

  categories.forEach((cat) => {
    map[cat._id.toString()] = { ...cat.toObject(), children: [] };
  });

  const tree: any[] = [];

  categories.forEach((cat) => {
    if (cat.parent && (cat.parent as any)._id) {
      map[(cat.parent as any)._id.toString()]?.children.push(map[cat._id.toString()]);
    } else {
      tree.push(map[cat._id.toString()]);
    }
  });

  return tree;
};

const updateSingleCategory = async (id: string, payload: Partial<TCategory>) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.CATEGORY.NOT_EXIST);
  }
  if (payload.parent && payload.parent.toString() !== id) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.CATEGORY.CANNOT_PARENT);
  }
  if (payload.parent) {
    const parentCategory = await Category.findById(payload.parent);
    if (!parentCategory) {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.CATEGORY.PARENT_NOT_EXIST);
    }
  }
  const result = await Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  return result;
};

const toggleCategoryStatus = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.CATEGORY.NOT_EXIST);
  }
  category.isActive = !category.isActive;
  await category.save();
  return category;
};

const deleteCategory = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.CATEGORY.NOT_EXIST);
  }

  const child = await Category.findOne({ parent: id });
  if (child) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.CATEGORY.CANNOT_DELETE);
  }

  const result = await Category.findByIdAndDelete(id);
  return result;
};

export const CategoryService = {
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
