/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from 'mongoose';

import { slugPlugin } from '@utils/generateUniqSlug.js';

import type { TAttributesProduct, TProduct } from './products.interface.js';

const AttributeSchema = new Schema<TAttributesProduct>(
  {
    key: {
      type: String,
      required: [true, 'Attribute key is required'],
      trim: true,
      minlength: [2, 'Attribute key must be at least 2 characters long'],
      maxlength: [50, 'Attribute key cannot exceed 50 characters'],
    },
    value: {
      type: [String],
      required: [true, 'Attribute value is required'],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'Attribute must have at least one value',
      },
    },
  },
  { _id: false },
);

// 🔹 Main Product Schema
const ProductSchema = new Schema<TProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters long'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Slug must be at least 3 characters long'],
      maxlength: [120, 'Slug cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      validate: {
        validator: function (this: any, value: number) {
          return !value || value < this.price;
        },
        message: 'Discount price must be less than the original price',
      },
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      minlength: [3, 'SKU must be at least 3 characters long'],
      maxlength: [50, 'SKU cannot exceed 50 characters'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
    },
    images: {
      type: [String],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'At least one image is required',
      },
    },
    brand: {
      type: String,
      trim: true,
      minlength: [2, 'Brand name must be at least 2 characters long'],
      maxlength: [50, 'Brand name cannot exceed 50 characters'],
    },
    attributes: {
      type: [AttributeSchema],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot be above 5'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: [true, 'Shop is required'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required!'],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

ProductSchema.plugin(slugPlugin, { source: 'name', field: 'slug' });

// 🔹 Indexes (for performance in large datasets)
ProductSchema.index({ name: 'text', description: 'text' }); // text search
ProductSchema.index({ slug: 1 }, { unique: true }); // unique URL
ProductSchema.index({ brand: 1 }); // filter by brand
ProductSchema.index({ 'attributes.key': 1, 'attributes.value': 1 }); // filter by attributes
ProductSchema.index({ price: 1 }); // price range filter
ProductSchema.index({ stock: 1 }); // stock filter

export const Product = model('Product', ProductSchema);
