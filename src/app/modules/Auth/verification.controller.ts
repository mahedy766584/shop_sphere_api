import status from 'http-status';

import { SuccessMessages } from '@constants/successMessages.js';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

import { VerificationService } from './verification.service.js';

const sendVerificationEmail = catchAsync(async (req, res) => {
  const { userName, email } = req.body;
  const result = await VerificationService.sendVerificationEmail(userName, email);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.AUTH.SENT_VERIFY_EMAIL,
    data: result,
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.query;
  const result = await VerificationService.verifyEmail(token as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.AUTH.EMAIL_VERIFIED,
    data: result,
  });
});

const resendVerificationEmail = catchAsync(async (req, res) => {
  const { userName } = req.body;
  const result = await VerificationService.resendVerificationEmail(userName);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: SuccessMessages.AUTH.EMAIL_VERIFIED,
    data: result,
  });
});

export const VerificationController = {
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
};
