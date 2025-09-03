import type { Model } from 'mongoose';

import type { USER_ROLE } from './user.constant.js';

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
  _id?: string;
  name: TName;
  userName: string;
  password: string;
  email: string;
  role: 'superAdmin' | 'admin' | 'seller' | 'customer';
  phone?: string;
  address?: TAddress;
  profileImage?: string;
  isEmailVerified: boolean;
  status: 'active' | 'pending' | 'blocked' | 'suspended' | 'deleted';
  isBanned: boolean;
  isDeleted: boolean;
  tokenVersion?: number;
  passwordChangedAt?: Date;
  emailVerifiedAt?: Date | null;
};

export interface UserModel extends Model<TUser> {
  isUserExistByUserName(userName: string): Promise<TUser | null>;

  isPasswordMatched(plainTextPassword: string, hashedPassword: string): Promise<boolean>;

  isJwtIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}

export type TUserRole = keyof typeof USER_ROLE;
