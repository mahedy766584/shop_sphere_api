import status from 'http-status';

import config from '@config/index.js';

import { ErrorMessages } from '@constants/errorMessages.js';
import { SuccessMessages } from '@constants/successMessages.js';

import AppError from '@errors/appError.js';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

import { AuthService } from './auth.service.js';

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body);

  const { accessToken, refreshToken } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.AUTH.LOGIN_SUCCESS,
    data: {
      accessToken,
    },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body;
  const result = await AuthService.changePassword(req.user, passwordData);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.AUTH.PASSWORD_CHANGED,
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthService.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.AUTH.NEW_ACCESS_TOKEN,
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const { userName } = req.body;

  const result = await AuthService.forgetPassword(userName);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.AUTH.PASSWORD_RESET_SUCCESS,
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new AppError(status.UNAUTHORIZED, ErrorMessages.AUTH.UNAUTHORIZED);
  }

  const result = await AuthService.resetPassword(req.body, token);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.AUTH.PASSWORD_CHANGED,
    data: result,
  });
});

export const AuthController = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
