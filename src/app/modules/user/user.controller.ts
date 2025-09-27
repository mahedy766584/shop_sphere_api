import type { TJwtPayload } from '@interface/index.js';
import status from 'http-status';

import catchAsync from '../../utils/async/catchAsync.js';
import sendResponse from '../../utils/common/sendResponse.js';
import { UserService } from './user.service.js';

const createUserIntoDB = catchAsync(async (req, res) => {
  const result = await UserService.createUserIntoDB(req.file, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'User is created successfully',
    data: result,
  });
});

const getAllUserFromDB = catchAsync(async (req, res) => {
  const result = await UserService.getAllUserFromDB();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'User is retrieved successfully',
    data: result,
  });
});

const getSingleUserFromDB = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.getSingleUserFromDB(id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'User is retrieved successfully',
    data: result,
  });
});

const updateSingleUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const authUser = req.user as TJwtPayload;
  const result = await UserService.updateSingleUser(id, authUser, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'User is updated successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const authUser = req.user as TJwtPayload;
  const result = await UserService.getMyProfile(authUser);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Profile fetched successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const authUser = req.user as TJwtPayload;
  const result = await UserService.updateMyProfile(authUser, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

export const UserController = {
  createUserIntoDB,
  getAllUserFromDB,
  getSingleUserFromDB,
  updateSingleUser,
  getMyProfile,
  updateMyProfile,
};
