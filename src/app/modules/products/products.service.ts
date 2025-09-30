/* eslint-disable @typescript-eslint/no-explicit-any */
import AuditService from '@modules/auditLog/auditLog.service.js';
import NotificationService from '@modules/notification/notification.service.js';
import QueryBuilder from 'app/builder/QueryBuilder.js';
import type { Express } from 'express';
import status from 'http-status';
import { Types } from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { withTransaction } from '@utils/db/withTransaction.js';
import { uploadImageToCloudinary } from '@utils/file/sendImageToCloudinary.js';
import { checkSellerProfile, ensureSellerStatus } from '@utils/guards/checkSellerProfile.js';
import { checkShopOwnership } from '@utils/guards/checkShopOwnership.js';
import { checkUserStatus } from '@utils/guards/checkUserStatus.js';
import { validateDiscount } from '@utils/validators/validateDiscount.js';

import { searchableField } from './product.constant.js';
import type { TProduct, UpdateProductPayload } from './products.interface.js';
import { Product } from './products.model.js';

const createProductIntoDB = async (
  files: Express.Multer.File[] | undefined,
  shopId: string,
  userId: string,
  role: string,
  payload: TProduct,
) => {
  return withTransaction(async (session) => {
    // ✅ guards
    const userExist = await checkUserStatus(userId, session);
    const seller = await checkSellerProfile(userId, session);
    ensureSellerStatus(seller, ['approved']);
    const shop = await checkShopOwnership(shopId, userId, session);

    // ✅ product exist check
    const existingProduct = await Product.findOne({
      name: payload.name,
      brand: payload.brand,
      shop: shop._id,
    }).session(session);

    if (existingProduct) throw new AppError(status.CONFLICT, ErrorMessages.PRODUCT.PRODUCT_EXIST);

    // ✅ validations
    validateDiscount(payload.price, payload.discountPrice);

    if (payload.stock === 0) payload.isActive = false;

    payload.createdBy = new Types.ObjectId(userExist._id);
    payload.shop = shop._id;

    if (files && files.length > 0) {
      const imageUrls = await uploadImageToCloudinary(files, payload.name);
      payload.images = imageUrls as string[];
    }

    const [newProduct] = await Product.create([payload], { session });

    await AuditService.createFromDocs(
      {
        resourceType: 'CREATE_PRODUCT',
        resourceId: newProduct._id,
        action: 'create',
        performedBy: new Types.ObjectId(userId),
        previousData: null,
        newData: newProduct.toObject(),
        meta: { shopId: shopId, sellerId: seller?._id, role: role },
      },
      { session },
    );

    await NotificationService.createForUser(
      {
        user: shop.owner,
        type: 'system',
        title: 'New Product Created',
        message: `${payload.name} has been added to your shop.`,
        channels: ['in_app'],
        locale: 'en',
        priority: 'normal',
        dedupeKey: `Create product. name: ${shop.name}, id:${shop._id}`,
      },
      { session },
    );

    return newProduct;
  });
};

const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(Product.find({ isDeleted: false }), query)
    .search(searchableField)
    .filter()
    .fields()
    .sort()
    .paginate();

  const result = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return { meta, result };
};

const getSingleProductFromDB = async (productId: string) => {
  const product = await Product.findById(productId).populate('shop').populate('createdBy');
  if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);
  return product;
};

const updateProductIntoDB = async (
  productId: string,
  userId: string,
  role: string,
  files: Express.Multer.File[] | undefined,
  payload: UpdateProductPayload,
) => {
  return withTransaction(async (session) => {
    //✅ guards
    await checkUserStatus(userId, session);
    const seller = await checkSellerProfile(userId, session);
    ensureSellerStatus(seller, ['approved']);

    //✅ find product
    const product = await Product.findById(productId).session(session);
    if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

    const shopId = product.shop?.toString();
    if (!shopId) throw new AppError(status.BAD_REQUEST, 'Product does not belong to any shop');

    //✅ ownership check
    await checkShopOwnership(shopId, userId, session);
    if (payload.stock === 0) payload.isActive = false;

    const modifiedData: Record<string, any> = {};
    const updateOps: Record<string, any> = {};

    // ✅ basic fields
    if (payload.name !== undefined) modifiedData.name = payload.name;
    if (payload.description !== undefined) modifiedData.description = payload.description;
    if (payload.brand !== undefined) modifiedData.brand = payload.brand;
    if (payload.price !== undefined) modifiedData.price = payload.price;
    if (payload.discountPrice !== undefined) modifiedData.discountPrice = payload.discountPrice;
    if (payload.sku !== undefined) modifiedData.sku = payload.sku;
    if (payload.stock !== undefined) {
      modifiedData.stock = payload.stock;
      if (payload.stock === 0) modifiedData.isActive = false;
    }
    if (payload.isActive !== undefined) modifiedData.isActive = payload.isActive;
    if (payload.isFeatured !== undefined) modifiedData.isFeatured = payload.isFeatured;
    if (payload.category !== undefined) modifiedData.category = payload.category;

    // ✅ Discount validation
    const basePrice = payload.price ?? product.price;
    validateDiscount(basePrice, payload.discountPrice);

    // ✅ Attributes handling
    // Replace whole attributes array
    if (payload.attributes && payload.replaceAttributes) {
      modifiedData.attributes = payload.attributes;
    }

    // Add new attributes
    if (payload.attributesToAdd && payload.attributesToAdd.length) {
      updateOps.$push = updateOps.$push || {};
      updateOps.$push.attributes = { $each: payload.attributesToAdd };
    }

    // Remove attributes by key
    if (payload.attributesToRemove && payload.attributesToRemove.length) {
      updateOps.$pull = updateOps.$pull || {};
      updateOps.$pull.attributes = { key: { $in: payload.attributesToRemove } };
    }

    // Update specific attributes by key
    if (payload.attributesToUpdate && payload.attributesToUpdate.length) {
      updateOps.$set = updateOps.$set || {};
      payload.attributesToUpdate.forEach((attr, idx) => {
        updateOps.$set[`attributes.$[elem${idx}].value`] = attr.value;
      });
    }

    // ✅ Images handling
    if (files && files.length > 0) {
      const uploadsUrls = await uploadImageToCloudinary(files, payload.name as string);

      if (payload.replaceImages) {
        modifiedData.images = uploadsUrls;
      } else {
        updateOps.$push = updateOps.$push || {};
        updateOps.$push.images = { $each: uploadsUrls };
      }
    }

    // Remove selected images
    if (payload.imagesToRemove && payload.imagesToRemove.length) {
      updateOps.$pull = updateOps.$pull || {};
      updateOps.$pull.images = { $in: payload.imagesToRemove };
    }

    // 🔹 Build query options
    const queryOptions: any = { new: true, session };
    if (payload.attributesToUpdate && payload.attributesToUpdate.length) {
      queryOptions.arrayFilters = payload.attributesToUpdate.map((attr, idx) => ({
        [`elem${idx}.key`]: attr.key,
      }));
    }

    // 🔹 Update in DB
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, shop: shopId },
      {
        $set: modifiedData,
        ...(updateOps.$set ? { $set: updateOps.$set } : {}),
        ...(updateOps.$push ? { $push: updateOps.$push } : {}),
        ...(updateOps.$pull ? { $pull: updateOps.$pull } : {}),
      },
      queryOptions,
    );

    if (!updatedProduct) throw new AppError(status.BAD_REQUEST, 'Product update failed');

    // 🔹 Audit log
    await AuditService.createFromDocs(
      {
        resourceType: 'UPDATE_PRODUCT',
        resourceId: productId,
        action: 'update',
        performedBy: new Types.ObjectId(userId),
        previousData: product.toObject(),
        newData: updatedProduct,
        meta: { shopId: shopId, sellerId: seller?._id, role },
      },
      { session },
    );

    // 🔹 Notification
    await NotificationService.createForUser(
      {
        user: product.createdBy,
        type: 'system',
        title: 'Product Updated',
        message: `${product.name} has been updated in your shop.`,
        channels: ['in_app'],
        locale: 'en',
        priority: 'normal',
        dedupeKey: `Update product. name: ${product.name}, id:${shopId}`,
      },
      { session },
    );

    return updatedProduct;
  });
};

const softDeleteProductFromDB = async (productId: string, userId: string) => {
  return withTransaction(async (session) => {
    //✅ guards
    await checkUserStatus(userId, session);
    const seller = await checkSellerProfile(userId, session);
    ensureSellerStatus(seller, ['approved']);

    //✅ find product
    const product = await Product.findById(productId).session(session);
    if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);
    if (product.isDeleted)
      throw new AppError(status.BAD_REQUEST, ErrorMessages.PRODUCT.ALREADY_DELETED);

    const shopId = product.shop?.toString();
    if (!shopId) throw new AppError(status.BAD_REQUEST, 'Product does not belong to any shop');

    //✅ ownership check
    await checkShopOwnership(shopId, userId, session);

    const productDelete = await Product.findOneAndUpdate(
      { _id: product, shop: shopId },
      { isDeleted: true, isActive: false },
      { new: true, session },
    );

    if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

    await AuditService.createFromDocs(
      {
        resourceType: 'DELETE_PRODUCT',
        resourceId: product._id,
        action: 'delete',
        performedBy: new Types.ObjectId(userId),
        previousData: null,
        newData: product.toObject(),
        meta: { shopId: shopId, sellerId: seller?._id },
      },
      { session },
    );

    return productDelete;
  });
};

const restoreProductIntoDB = async (userId: string, productId: string) => {
  return withTransaction(async (session) => {
    //✅ guards
    await checkUserStatus(userId, session);
    const seller = await checkSellerProfile(userId, session);
    ensureSellerStatus(seller, ['approved']);
    //✅ find product
    const product = await Product.findById(productId).session(session);
    if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

    const shopId = product.shop?.toString();
    if (!shopId) throw new AppError(status.BAD_REQUEST, 'Product does not belong to any shop');

    //✅ ownership check
    await checkShopOwnership(shopId, userId, session);

    const productDelete = await Product.findOneAndUpdate(
      { _id: product, shop: shopId },
      { isDeleted: false, isActive: true },
      { new: true, session },
    );

    if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

    await AuditService.createFromDocs(
      {
        resourceType: 'RESTORE_PRODUCT',
        resourceId: product._id,
        action: 'restore',
        performedBy: new Types.ObjectId(userId),
        previousData: null,
        newData: product.toObject(),
        meta: { shopId: shopId, sellerId: seller?._id },
      },
      { session },
    );

    return productDelete;
  });
};

const updateProductStock = async (userId: string, productId: string, stock: number) => {
  return withTransaction(async (session) => {
    //✅ guards
    await checkUserStatus(userId, session);
    const seller = await checkSellerProfile(userId, session);
    ensureSellerStatus(seller, ['approved']);
    //✅ find product
    const product = await Product.findById(productId).session(session);
    if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

    const shopId = product.shop?.toString();
    if (!shopId) throw new AppError(status.BAD_REQUEST, 'Product does not belong to any shop');

    //✅ ownership check
    await checkShopOwnership(shopId, userId, session);

    const productDelete = await Product.findOneAndUpdate(
      { _id: product._id, shop: shopId },
      { $set: { stock: Number(stock) } },
      { new: true, session },
    );

    if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

    await AuditService.createFromDocs(
      {
        resourceType: 'RESTORE_PRODUCT',
        resourceId: product._id,
        action: 'restore',
        performedBy: new Types.ObjectId(userId),
        previousData: null,
        newData: product.toObject(),
        meta: { shopId: shopId, sellerId: seller?._id },
      },
      { session },
    );

    return productDelete;
  });
};

const getProductByShopFromDB = async (shopId: string, query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(Product.find({ shop: shopId, isDeleted: false }), query)
    .search(['brand', 'name'])
    .filter()
    .sort()
    .fields()
    .paginate();

  const result = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return { meta, result };
};

const toggleProductStatus = async (userId: string, productId: string) => {
  return withTransaction(async (session) => {
    //✅ guards
    await checkUserStatus(userId, session);
    const seller = await checkSellerProfile(userId, session);
    ensureSellerStatus(seller, ['approved']);
    //✅ find product
    const product = await Product.findById(productId).session(session);
    if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

    const shopId = product.shop?.toString();
    if (!shopId) throw new AppError(status.BAD_REQUEST, 'Product does not belong to any shop');

    //✅ ownership check
    await checkShopOwnership(shopId, userId, session);

    product.isActive = !product.isActive;
    await product.save({ session });

    if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

    return product;
  });
};

const toggleProductFeatures = async (userId: string, productId: string) => {
  return withTransaction(async (session) => {
    //✅ guards
    await checkUserStatus(userId, session);
    const seller = await checkSellerProfile(userId, session);
    ensureSellerStatus(seller, ['approved']);
    //✅ find product
    const product = await Product.findById(productId).session(session);
    if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

    const shopId = product.shop?.toString();
    if (!shopId) throw new AppError(status.BAD_REQUEST, 'Product does not belong to any shop');

    //✅ ownership check
    await checkShopOwnership(shopId, userId, session);

    product.isFeatured = !product.isFeatured;
    await product.save({ session });

    if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

    return product;
  });
};

export const ProductService = {
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
