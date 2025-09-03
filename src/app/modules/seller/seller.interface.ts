import type { Types } from 'mongoose';

export type TSellerProfile = {
  user: Types.ObjectId;
  businessName: string;
  tradeLicense: string;
  bankAccount: string;
  documents?: string[];
  status: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
};
