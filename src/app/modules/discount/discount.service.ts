import { Order } from '@modules/order/order.model.js';
import { Product } from '@modules/products/products.model.js';
import status from 'http-status';
import mongoose from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { validateDates } from '@utils/validators/validateDates.js';
import { validateDiscountValue } from '@utils/validators/validateDiscountValue.js';

import type { TProductDiscount } from './discount.interface.js';
import { ProductDiscount } from './discount.model.js';
import { getBestActiveDiscountForProduct } from './discount.utils.js';

const createProductDiscountIntoDB = async (userId: string, payload: TProductDiscount) => {
  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  validateDates(startDate, endDate);
  validateDiscountValue(payload.discountType, payload.discountValue);

  // 5️⃣ Check product existence & status
  const product = await Product.findById(payload.productId);
  if (!product) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);
  }

  if (!product.isActive) {
    throw new AppError(status.BAD_REQUEST, 'Cannot apply discount to inactive product.');
  }

  // 6️⃣ Owner permission check
  if (product.createdBy.toString() !== userId.toString()) {
    throw new AppError(
      status.FORBIDDEN,
      'You are not allowed to create a discount on this product.',
    );
  }

  // 7️⃣ Prevent overlapping discounts
  const overlapping = await ProductDiscount.findOne({
    productId: payload.productId,
    isActive: true,
    $or: [
      { startDate: { $lte: payload.endDate, $gte: payload.startDate } },
      { endDate: { $gte: payload.startDate, $lte: payload.endDate } },
    ],
  });

  if (overlapping) {
    throw new AppError(
      status.BAD_REQUEST,
      'Another active discount overlaps with this date range.',
    );
  }

  // 8️⃣ Ensure discount doesn't make price too low
  const finalPrice =
    product.price -
    (payload.discountType === 'flat'
      ? payload.discountValue
      : product.price * (payload.discountValue / 100));

  if (finalPrice < 1) {
    throw new AppError(
      status.BAD_REQUEST,
      'Discount would reduce product price below minimum allowed.',
    );
  }

  // 9️⃣ Create discount with audit info
  const discount = await ProductDiscount.create({
    ...payload,
    isActive: true,
    createdBy: userId,
    createdAt: new Date(),
  });

  await syncProductDiscountPrice(payload.productId.toString());

  return discount;
};

const updateProductDiscount = async (
  userId: string,
  discountId: string,
  payload: Partial<TProductDiscount>,
) => {
  // 1️⃣ Find discount
  const discount = await ProductDiscount.findById(discountId);
  if (!discount) {
    throw new AppError(status.NOT_FOUND, 'Discount not found!');
  }

  // 2️⃣ Validate dates
  if (!payload.startDate || !payload.endDate)
    throw new AppError(status.BAD_REQUEST, 'Start and end dates are required.');

  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
    throw new AppError(status.BAD_REQUEST, 'Invalid date format.');

  // 2️⃣ Validate startDate is not in the past
  if (payload.startDate > new Date()) {
    throw new AppError(status.BAD_REQUEST, 'Start date cannot be in the past.');
  }

  const duration = endDate.getTime() - startDate.getTime();
  if (duration > 90 * 24 * 60 * 60 * 1000) {
    throw new AppError(status.BAD_REQUEST, 'Discount duration cannot exceed 90 days.');
  }

  // 3️⃣ Validate value
  if (
    payload.discountType === 'percentage' &&
    (payload.discountValue === null ||
      payload.discountValue === undefined ||
      payload.discountValue <= 0 ||
      payload.discountValue > 100)
  ) {
    throw new AppError(status.BAD_REQUEST, 'Percentage discount must be 1-100.');
  }

  if (
    payload.discountType === 'flat' &&
    (payload.discountValue === null ||
      payload.discountValue === undefined ||
      payload.discountValue <= 0)
  ) {
    throw new AppError(status.BAD_REQUEST, 'Flat discount must be > 0.');
  }

  // 4️⃣ Product check
  const product = await Product.findById(payload.productId ?? discount.productId);
  if (!product) throw new AppError(status.NOT_FOUND, 'Product not found.');

  if (!product.isActive) throw new AppError(status.BAD_REQUEST, 'Product must be active.');

  // 5️⃣ Owner check
  if (product.createdBy.toString() !== userId.toString())
    throw new AppError(status.FORBIDDEN, 'You do not own this product.');

  //6️⃣ Overlapping check
  const overlapping = await ProductDiscount.findOne({
    _id: { $ne: discountId },
    productId: product?._id,
    isActive: true,
    $or: [
      { startDate: { $lte: payload.endDate, $gte: payload.startDate } },
      { endDate: { $gte: payload.startDate, $lte: payload.endDate } },
    ],
  });
  if (overlapping) throw new AppError(status.BAD_REQUEST, 'Another active discount overlaps.');

  // 7️⃣ Price check
  const discountedPrice =
    payload.discountType === 'flat'
      ? product.price - (payload.discountValue ?? 0)
      : product.price - product.price * ((payload.discountValue ?? 0) / 100);
  if (discountedPrice < 1) throw new AppError(status.BAD_REQUEST, 'Discount makes price too low.');

  // 8️⃣ Update
  Object.assign(discount, payload);
  await discount.save();

  return discount;
};

const deleteProductDiscount = async (userId: string, discountId: string) => {
  // 1️⃣ Find discount
  const discount = await ProductDiscount.findById(discountId);
  if (!discount) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.DISCOUNT.NOT_FOUND);
  }

  // 2️⃣ Ownership / permission check
  const product = await Product.findById(discount.productId);
  if (!product) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);
  }

  if (product.createdBy.toString() !== userId.toString()) {
    throw new AppError(
      status.FORBIDDEN,
      'You are not allowed to delete this discount on this product.',
    );
  }

  // 3️⃣ Prevent delete if discount is active and already started
  if (discount.startDate <= new Date() && discount.isActive) {
    throw new AppError(
      status.BAD_REQUEST,
      'Cannot delete an active discount that has already started.',
    );
  }

  // 4️⃣ Check for any active/pending orders using this discount
  const activeOrders = await Order.find({
    product: discount.productId,
    status: { $in: ['shipped', 'pending'] },
  });
  if (activeOrders.length > 0) {
    throw new AppError(
      status.BAD_REQUEST,
      'Cannot delete discount linked to active or pending orders.',
    );
  }

  // 5️⃣ Soft delete instead of hard delete (recommended)
  discount.isActive = false;
  await discount.save();

  return discount;
};

const getAllDiscounts = async () => {
  return await ProductDiscount.find().populate('productId');
};

const getDiscountById = async (discountId: string) => {
  return await ProductDiscount.findById(discountId).populate('productId');
};

const getDiscountsByProduct = async (productId: string) => {
  return await ProductDiscount.find({ productId: new mongoose.Types.ObjectId(productId) })
    .populate('productId')
    .sort({
      createdAt: -1,
    });
};

const setDiscountActiveStatus = async (discountId: string, isActive: boolean) => {
  const discount = await ProductDiscount.findById(discountId);
  if (!discount) throw new AppError(status.NOT_FOUND, ErrorMessages.DISCOUNT.NOT_FOUND);

  // 1️⃣ If activating, validate date range
  if (isActive) {
    const nowDate = new Date();
    if (discount.startDate && discount.startDate > nowDate) {
      throw new AppError(status.BAD_REQUEST, 'Discount period has not started yet');
    }
    if (discount.endDate && discount.endDate < nowDate) {
      throw new AppError(status.BAD_REQUEST, 'Discount period has already ended');
    }
  }

  // 2️⃣ Check product status and stock
  const product = await Product.findById(discount.productId);
  if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);
  if (isActive && (!product.isActive || product.stock <= 0)) {
    throw new AppError(
      status.BAD_REQUEST,
      'Cannot activate discount on inactive or out-of-stock product',
    );
  }

  // 3️⃣ Validate discount amount vs product price
  if (isActive) {
    if (discount.discountValue && discount.discountValue >= product.price) {
      throw new AppError(status.BAD_REQUEST, 'Discount amount cannot exceed product price');
    }
    if (discount.discountType === 'percentage' && discount.discountValue > 90) {
      throw new AppError(status.BAD_REQUEST, 'High discount (>90%) needs admin approval');
    }
  }

  // 4️⃣ Only one active discount per product
  if (isActive) {
    await ProductDiscount.updateMany(
      {
        productId: discount.productId,
        isActive: true,
        _id: { $ne: discountId },
      },
      { $set: { isActive: false } },
    );
  }

  // 5️⃣ Set active status
  discount.isActive = isActive;

  await discount.save();

  return discount;
};

const syncProductDiscountPrice = async (productId: string) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

  const best = await getBestActiveDiscountForProduct(productId);

  if (best) {
    const discounted =
      best.discountType === 'percentage'
        ? product.price - (product.price * best.discountValue) / 100
        : product.price - best.discountValue;
    product.discountPrice = Math.max(discounted, 1);
  } else {
    product.discountPrice = undefined;
  }

  await product.save();

  return product;
};

const getTopDiscountedProducts = async () => {
  const nowDate = new Date();

  const result = await ProductDiscount.aggregate([
    // 1️⃣ Only currently active discounts
    {
      $match: {
        isActive: true,
        startDate: { $lte: nowDate },
        endDate: { $gte: nowDate },
      },
    },

    // 2️⃣ Calculate actual discount amount (flat or percentage)
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },

    // 3️⃣ Filter out deleted/inactive products
    {
      $match: {
        'product.isActive': true,
        'product.isDeleted': false,
      },
    },

    // 4️⃣ Calculate discount amount in money for sorting
    {
      $addFields: {
        actualDiscount: {
          $cond: [
            { $eq: ['$discountType', 'percentage'] },
            { $multiply: ['$product.price', { $divide: ['$discountValue', 100] }] },
            '$discountValue',
          ],
        },
      },
    },

    // 5️⃣ Group by product to get highest discount per product
    {
      $group: {
        _id: '$productId',
        product: { $first: '$product' },
        maxDiscountValue: { $max: '$discountValue' },
        maxDiscountAmount: { $max: '$actualDiscount' },
      },
    },

    // 6️⃣ Sort by actual discount amount
    { $sort: { maxDiscountAmount: -1 } },

    // 7️⃣ Limit top 10
    { $limit: 10 },

    // 8️⃣ Shape the output cleanly
    {
      $project: {
        _id: 0,
        productId: '$_id',
        name: '$product.name',
        price: '$product.price',
        discountAmount: '$maxDiscountAmount',
        discountValue: '$maxDiscountValue',
        images: '$product.images',
        sku: '$product.sku',
      },
    },
  ]);

  return result;
};

export const ProductDiscountService = {
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
