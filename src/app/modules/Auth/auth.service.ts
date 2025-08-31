import bcrypt from 'bcrypt';
import status from 'http-status';
import type { JwtPayload } from 'jsonwebtoken';

import config from '@config/index.js';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { sendEmail } from '@utils/sendEmail.js';

import { User } from '../user/user.model.js';
import type { TChangePassword, TLoginUser } from './auth.interface.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './auth.utils.js';
import type { AccessPayload } from './auth.utils.js';

const loginUser = async (payload: TLoginUser) => {
  const userExisting = await User.isUserExistByUserName(payload?.userName);
  if (!userExisting) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.USER.NOT_FOUND);
  }

  if (userExisting.isBanned) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.BANNED);
  }
  if (userExisting.isDeleted) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.DELETED);
  }
  if (['blocked', 'suspended'].includes(userExisting?.status)) {
    const msg =
      userExisting.status === 'blocked' ? ErrorMessages.USER.BLOCKED : ErrorMessages.USER.SUSPENDED;
    throw new AppError(status.FORBIDDEN, msg);
  }

  if (!(await User.isPasswordMatched(payload?.password, userExisting?.password))) {
    throw new AppError(status.FORBIDDEN, ErrorMessages.AUTH.INVALID_PASSWORD);
  }

  const accessTokenPayload: AccessPayload = {
    userId: userExisting?._id?.toString() as string,
    userName: userExisting?.userName,
    role: userExisting?.role,
  };

  const accessToken = generateAccessToken(accessTokenPayload);

  const refreshToken = generateRefreshToken({
    userId: userExisting?._id?.toString() as string,
    userName: userExisting?.userName,
    role: userExisting?.role,
    tokenVersion: userExisting?.tokenVersion,
  });

  return {
    accessToken,
    refreshToken,
  };
};

const changePassword = async (userData: JwtPayload, payload: TChangePassword) => {
  const userExisting = await User.isUserExistByUserName(userData?.userName);
  if (!userExisting) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.USER.NOT_FOUND);
  }
  if (userExisting?.isBanned) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.BANNED);
  }
  if (userExisting?.isDeleted) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages?.USER.DELETED);
  }
  if (['blocked', 'suspended'].includes(userExisting.status)) {
    const msg =
      userExisting?.status === 'blocked'
        ? ErrorMessages?.USER.BLOCKED
        : ErrorMessages?.USER?.SUSPENDED;
    throw new AppError(status.FORBIDDEN, msg);
  }

  if (!(await User.isPasswordMatched(payload?.oldPassword, userExisting?.password))) {
    throw new AppError(status.UNAUTHORIZED, ErrorMessages?.AUTH?.INVALID_PASSWORD);
  }

  const newHashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.password_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      _id: userData?.userId,
      role: userData?.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
      $inc: { tokenVersion: 1 },
    },
  );

  return null;
};

const refreshToken = async (token: string) => {
  const decoded = verifyRefreshToken(token);

  const { iat, userName } = decoded as JwtPayload & { userName: string };

  const userExisting = await User.isUserExistByUserName(userName);

  if (!userExisting) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.USER.NOT_FOUND);
  }

  if (userExisting.isBanned) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.BANNED);
  }
  if (userExisting.isDeleted) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.DELETED);
  }
  if (['blocked', 'suspended'].includes(userExisting?.status)) {
    const msg =
      userExisting.status === 'blocked' ? ErrorMessages.USER.BLOCKED : ErrorMessages.USER.SUSPENDED;
    throw new AppError(status.FORBIDDEN, msg);
  }

  if (
    userExisting?.passwordChangedAt &&
    iat &&
    User.isJwtIssuedBeforePasswordChanged(userExisting?.passwordChangedAt, iat as number)
  ) {
    throw new AppError(status.UNAUTHORIZED, ErrorMessages.AUTH.PASSWORD_CHANGED);
  }

  const accessTokenPayload: AccessPayload = {
    userId: userExisting?._id?.toString() as string,
    userName: userExisting?.userName,
    role: userExisting?.role,
  };

  const newAccessToken = generateAccessToken(accessTokenPayload);

  return {
    accessToken: newAccessToken,
    tokenType: 'Bearer',
    expiresIn: config.jwt_access_expires_in,
  };
};

const forgetPassword = async (userName: string) => {
  const userExisting = await User.isUserExistByUserName(userName);

  if (!userExisting) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.USER.NOT_FOUND);
  }

  if (userExisting.isBanned) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.BANNED);
  }
  if (userExisting.isDeleted) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.DELETED);
  }
  if (['blocked', 'suspended'].includes(userExisting?.status)) {
    const msg =
      userExisting.status === 'blocked' ? ErrorMessages.USER.BLOCKED : ErrorMessages.USER.SUSPENDED;
    throw new AppError(status.FORBIDDEN, msg);
  }

  const accessTokenPayload: AccessPayload = {
    userId: userExisting?._id?.toString() as string,
    userName: userExisting?.userName,
    role: userExisting?.role,
    expiresIn: '10m',
  };

  const newAccessToken = generateAccessToken(accessTokenPayload);

  const resetUiLink = `${config.reset_pass_ui_link}?id=${userExisting?._id}&token=${newAccessToken}`;

  sendEmail(userExisting?.email, resetUiLink);
};

const resetPassword = async (payload: { userName: string; newPassword: string }, token: string) => {
  const userExisting = await User.isUserExistByUserName(payload?.userName);

  if (!userExisting) {
    throw new AppError(status.NOT_FOUND, ErrorMessages.USER.NOT_FOUND);
  }

  if (userExisting.isBanned) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.BANNED);
  }
  if (userExisting.isDeleted) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.DELETED);
  }
  if (['blocked', 'suspended'].includes(userExisting?.status)) {
    const msg =
      userExisting.status === 'blocked' ? ErrorMessages.USER.BLOCKED : ErrorMessages.USER.SUSPENDED;
    throw new AppError(status.FORBIDDEN, msg);
  }

  const decode = verifyAccessToken(token);

  if (decode.userName !== payload?.userName) {
    throw new AppError(status.UNAUTHORIZED, ErrorMessages.AUTH.UNAUTHORIZED);
  }

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.password_salt_rounds),
  );

  await User.findOneAndUpdate(
    { userName: decode?.userName, role: decode?.role },
    { password: newHashedPassword, passwordChangedAt: new Date() },
  );
};

export const AuthService = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
