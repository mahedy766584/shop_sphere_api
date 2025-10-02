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
  isDeleted: boolean;
  category: Types.ObjectId;
  shop: Types.ObjectId | string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
};

export interface UpdateProductPayload extends Partial<TProduct> {
  // images handling
  replaceImages?: boolean;
  imagesToRemove?: string[];

  // attributes handling
  replaceAttributes?: boolean;
  attributesToAdd?: TAttributesProduct[];
  attributesToRemove?: string[];
  attributesToUpdate?: { key: string; value: string[] }[];
}
