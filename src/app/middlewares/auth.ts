/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TJwtPayload } from '@interface/index.js';
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@modules/Auth/auth.utils.js';
import type { TUserRole } from '@modules/user/user.interface.js';
import { User } from '@modules/user/user.model.js';
import status from 'http-status';
import type { JwtPayload } from 'jsonwebtoken';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import catchAsync from '@utils/catchAsync.js';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization || '';

    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
      throw new AppError(status.UNAUTHORIZED, ErrorMessages.AUTH.UNAUTHORIZED);
    }

    try {
      const decoded = verifyAccessToken(token);

      const { tokenVersion } = decoded as JwtPayload;

      const userExisting = await User.findById(decoded?.userId).select(
        'userName role isDeleted isBanned tokenVersion passwordChangedAt tokenVersion',
      );

      if (!userExisting) throw new AppError(status.NOT_FOUND, ErrorMessages.USER.NOT_FOUND);

      if (userExisting.isDeleted) throw new AppError(status.FORBIDDEN, ErrorMessages.USER.DELETED);

      if (userExisting.isBanned) throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.BANNED);

      if (tokenVersion !== undefined && tokenVersion !== userExisting?.tokenVersion) {
        throw new AppError(status.UNAUTHORIZED, ErrorMessages.AUTH.TOKEN_REVOKED);
      }

      if (
        userExisting.passwordChangedAt &&
        decoded.iat &&
        typeof User.isJwtIssuedBeforePasswordChanged === 'function' &&
        User.isJwtIssuedBeforePasswordChanged(userExisting?.passwordChangedAt, decoded?.iat)
      ) {
        throw new AppError(status.UNAUTHORIZED, ErrorMessages.AUTH.PASSWORD_CHANGED);
      }

      req.user = {
        userId: userExisting._id.toString(),
        userName: userExisting?.userName,
        role: userExisting?.role,
        tokenVersion: userExisting?.tokenVersion,
      } as TJwtPayload;

      const userRole = req?.user?.role;

      if (requiredRoles.length > 0 && (!userRole || !requiredRoles.includes(userRole))) {
        throw new AppError(status.FORBIDDEN, ErrorMessages.AUTH.ACCESS_DENIED);
      }

      return next();
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
          throw new AppError(status.UNAUTHORIZED, ErrorMessages.AUTH.UNAUTHORIZED);
        }

        try {
          const decodedRefresh = verifyRefreshToken(refreshToken);

          const { tokenVersion } = decodedRefresh as JwtPayload;

          const userExisting = await User.findById(decodedRefresh?.userId).select(
            'userName role isDeleted isBanned tokenVersion passwordChangedAt tokenVersion',
          );

          if (!userExisting) throw new AppError(status.NOT_FOUND, ErrorMessages.USER.NOT_FOUND);

          if (userExisting.isDeleted)
            throw new AppError(status.FORBIDDEN, ErrorMessages.USER.DELETED);

          if (userExisting.isBanned)
            throw new AppError(status.BAD_REQUEST, ErrorMessages.USER.BANNED);

          if (tokenVersion !== undefined && tokenVersion !== userExisting?.tokenVersion) {
            throw new AppError(status.UNAUTHORIZED, ErrorMessages.AUTH.TOKEN_REVOKED);
          }

          const newAccessToken = generateAccessToken({
            userId: userExisting?._id.toString(),
            userName: userExisting?.userName,
            role: userExisting?.role,
            tokenVersion: userExisting?.tokenVersion,
          });

          res.setHeader('x-new-token', newAccessToken);

          req.user = {
            userId: userExisting._id.toString(),
            userName: userExisting?.userName,
            role: userExisting?.role,
            tokenVersion: userExisting?.tokenVersion,
          } as TJwtPayload;

          const userRole = req?.user?.role;

          if (requiredRoles.length > 0 && (!userRole || requiredRoles.includes(userRole))) {
            throw new AppError(status.FORBIDDEN, ErrorMessages.AUTH.ACCESS_DENIED);
          }

          return next();
        } catch {
          throw new AppError(status.UNAUTHORIZED, ErrorMessages.AUTH.EXPIRED_TOKEN);
        }
      }
      throw new AppError(status.UNAUTHORIZED, ErrorMessages.AUTH.INVALID_TOKEN);
    }
  });
};

export default auth;
