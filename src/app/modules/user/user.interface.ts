import type { Model } from 'mongoose';

export type TName = {
  firstName: string;
  lastName: string;
};

export type TAddress = {
  type: 'home' | 'office' | 'other';
  street: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type TUser = {
  id?: string;
  name: TName;
  userName: string;
  password: string;
  email: string;
  role: 'superAdmin' | 'admin' | 'seller' | 'customer';
  phone?: string;
  address?: TAddress;
  profileImage?: string;
  isEmailVerified: boolean;
  isBanned: boolean;
};

export interface UserModel extends Model<TUser> {
  isUserExistByUserName(userName: string): Promise<TUser | null>;
}
