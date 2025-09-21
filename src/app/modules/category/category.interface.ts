import type { Types } from 'mongoose';

export type TCategory = {
  name: string;
  slug: string;
  parent?: Types.ObjectId;
  isActive: boolean;
};
