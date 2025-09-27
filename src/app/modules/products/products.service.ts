import { SellerProfile } from '@modules/seller/seller.model.js';
import { Shop } from '@modules/shop/shop.model.js';
import { User } from '@modules/user/user.model.js';
import type { Express } from 'express';
import status from 'http-status';
import mongoose, { Types } from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { uploadImageToCloudinary } from '@utils/file/sendImageToCloudinary.js';
import { checkSellerProfile } from '@utils/guards/checkSellerProfile.js';
import { checkUserStatus } from '@utils/guards/checkUserStatus.js';

import { allowedAttributes } from './product.constant.js';
import type { TProduct } from './products.interface.js';
import { Product } from './products.model.js';

const createProductIntoDB = async (
  files: Express.Multer.File[] | undefined,
  shopId: string,
  userId: string,
  payload: TProduct,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ✅ reusable utility functions
    const userExist = await checkUserStatus(userId, session);
    const seller = await checkSellerProfile(userId, session);
    if (!seller) throw new AppError(status.FORBIDDEN, ErrorMessages.SELLER.NOT_FOUND);

    const shop = await Shop.findById(shopId).session(session);
    if (!shop) throw new AppError(status.NOT_FOUND, ErrorMessages.SHOP.NOT_FOUND);
    if (shop.owner.toString() !== seller._id.toString())
      throw new AppError(status.FORBIDDEN, ErrorMessages.SHOP.NOT_OWNER);

    const existingProduct = await Product.findOne({
      name: payload.name,
      brand: payload.brand,
      shop: shop._id,
    }).session(session);

    if (existingProduct) throw new AppError(status.CONFLICT, ErrorMessages.PRODUCT.PRODUCT_EXIST);

    if (payload.discountPrice && payload.discountPrice > payload.price * 0.5)
      throw new AppError(status.BAD_REQUEST, ErrorMessages.PRODUCT.DISCOUNT);

    if (payload.stock === 0) payload.isActive = false;

    payload.attributes?.forEach((attr) => {
      if (!allowedAttributes.includes(attr.key))
        throw new AppError(
          status.BAD_REQUEST,
          ErrorMessages.PRODUCT.NOT_ALLOWED_ATTRIBUTE(attr.key),
        );
    });

    payload.createdBy = new Types.ObjectId(userExist._id);
    payload.shop = shop._id;

    if (files && files.length > 0) {
      const imageUrls = await uploadImageToCloudinary(files, payload.name);
      payload.images = imageUrls as string[];
    }

    const newProduct = await Product.create([payload], { session });

    await session.commitTransaction();
    await session.endSession();

    return newProduct[0];
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

export const ProductService = {
  createProductIntoDB,
};
