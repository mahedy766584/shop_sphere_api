import status from 'http-status';

import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';

import { UserService } from './user.service.js';

const createUserIntoDB = catchAsync(async (req, res) => {
  const result = await UserService.createUserIntoDB(req.body);
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

export const UserController = {
  createUserIntoDB,
  getAllUserFromDB,
  getSingleUserFromDB,
};
