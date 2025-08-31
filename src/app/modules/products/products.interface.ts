import type { Types } from 'mongoose';

export type TAttributesProduct = {
  key: string;
  value: string[];
};

export type TProduct = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  sku: string;
  stock: number;
  images: string[];
  brand?: string;
  attributes?: TAttributesProduct[];
  averageRating: number;
  isFeatured: boolean;
  isActive: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
};
