import { model, Schema } from 'mongoose';

import { slugPlugin } from '@utils/common/generateUniqSlug.js';

import type { TCategory } from './category.interface.js';

const categorySchema = new Schema<TCategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.plugin(slugPlugin, { source: 'name', field: 'slug' });

export const Category = model<TCategory>('Category', categorySchema);
