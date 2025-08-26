import { model, Schema } from 'mongoose';

import type { TAddress, TName, TUser, UserModel } from './user.interface.js';

const nameSchema = new Schema<TName>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      maxLength: [20, 'First name must not exceed 20 characters'],
      minLength: [2, 'First name must be at least 2 characters'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      maxLength: [20, 'Last name must not exceed 20 characters'],
      minLength: [2, 'Last name must be at least 2 characters'],
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const addressSchema = new Schema<TAddress>(
  {
    type: {
      type: String,
      enum: {
        values: ['home', 'office', 'other'],
        message: 'Address type must be either: home, office, or other',
      },
      required: [true, 'Address type is required'],
    },
    street: {
      type: String,
      required: [true, 'Street is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const userSchema = new Schema<TUser>(
  {
    name: {
      type: nameSchema,
      required: [true, 'Name is required'],
    },
    userName: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxLength: [30, 'Username must not exceed 30 characters'],
      minLength: [4, 'Username must be at least 4 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [8, 'Password must be at least 8 characters'],
      maxLength: [128, 'Password must not exceed 128 characters'],
      select: false,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/.+@.+\..+/, 'Please provide a valid email address'],
      index: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ['superAdmin', 'admin', 'seller', 'customer'],
        message: 'Role must be one of: superAdmin, admin, seller, customer',
      },
      default: 'customer',
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: addressSchema,
    },
    profileImage: {
      type: String,
      default: 'https://ibb.co/jkx7zn2',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

userSchema.virtual('fullName').get(function () {
  return `${this.name?.firstName} ${this.name?.lastName}`;
});

userSchema.statics.isUserExistByUserName = async function (userName: string) {
  const userExist = await User.findOne({ userName });
  return userExist;
};

export const User = model<TUser, UserModel>('User', userSchema);
