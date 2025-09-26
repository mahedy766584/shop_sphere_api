import type { Types } from 'mongoose';

export type TShop = {
  _id: string | Types.ObjectId;
  name: string;
  description?: string;
  location?: string;
  isVerified: boolean;
  isActive: boolean;
  isDeleted?: boolean;
  owner: Types.ObjectId;
  sellerProfile: Types.ObjectId;
};
