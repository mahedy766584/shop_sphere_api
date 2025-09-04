import type { Types } from 'mongoose';

export type TShop = {
  name: string;
  description?: string;
  location?: string;
  isVerified: boolean;
  owner: Types.ObjectId;
};

// https://youtu.be/Rpd54oAHDD0
