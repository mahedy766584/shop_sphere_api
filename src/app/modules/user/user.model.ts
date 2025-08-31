import bcrypt from 'bcrypt';
import { model, Schema } from 'mongoose';

import config from '@config/index.js';

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
    status: {
      type: String,
      enum: {
        values: ['active', 'pending', 'blocked', 'suspended', 'deleted'],
        message: 'Role must be one of: active, pending, blocked, suspended, deleted',
      },
      default: 'active',
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: {
      type: Date,
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
  return await User.findOne({ userName }).select('+password');
};

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, Number(config.password_salt_rounds));
  next();
});

userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

userSchema.statics.isPasswordMatched = async function (plainTextPassword, hashedPassword) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJwtIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  const passwordChangedTime = new Date(passwordChangedTimestamp).getTime() / 1000;

  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = model<TUser, UserModel>('User', userSchema);
