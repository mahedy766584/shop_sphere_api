/* eslint-disable @typescript-eslint/no-unused-vars */
import config from 'app/config/index.js';
import { ErrorMessages } from 'app/constants/errorMessages.js';
import AppError from 'app/errors/appError.js';
import status from 'http-status';
import jwt from 'jsonwebtoken';
import type { SignOptions, JwtPayload } from 'jsonwebtoken';

export type AccessPayload = {
  userId: string;
  userName?: string;
  role?: string;
  tokenVersion?: number;
  expiresIn?: string;
};

const signToken = (payload: object, secret: string, expiresIn: string | number): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, secret, options);
};

const verifyToken = <T extends object = JwtPayload>(token: string, secret: string) => {
  try {
    return jwt.verify(token, secret) as T;
  } catch (error) {
    throw new AppError(status.UNAUTHORIZED, ErrorMessages.AUTH.INVALID_TOKEN);
  }
};

export const generateAccessToken = (payload: AccessPayload): string => {
  return signToken(payload, config.jwt_access_secret!, config.jwt_access_expires_in!);
};

export const generateRefreshToken = (payload: AccessPayload) => {
  return signToken(payload, config.jwt_refresh_secret!, config.jwt_refresh_expires_in!);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return verifyToken(token, config.jwt_access_secret!);
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return verifyToken(token, config.jwt_refresh_secret!);
};
