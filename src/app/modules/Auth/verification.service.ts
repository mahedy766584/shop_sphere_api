import { User } from '@modules/user/user.model.js';
import status from 'http-status';

import config from '@config/index.js';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { sendEmail } from '@utils/communication/sendEmail.js';

import { generateEmailVerificationToken, verifyEmailVerificationToken } from './auth.utils.js';

const sendVerificationEmail = async (userName: string, email: string) => {
  const token = generateEmailVerificationToken(userName);
  const verifyLink = `${config.api_base_url}/auth/verify-email?token=${token}`;
  await sendEmail(email, verifyLink);
  return verifyLink;
};

const verifyEmail = async (token: string) => {
  const decoded = verifyEmailVerificationToken(token);
  const userName = decoded.userName as string;
  const user = await User.findOneAndUpdate(
    { userName },
    { isEmailVerified: true, emailVerifiedAt: new Date() },
    { new: true },
  );
  if (!user) throw new AppError(status.NOT_FOUND, ErrorMessages.USER.NOT_FOUND);
  if (user?.isEmailVerified) {
    throw new AppError(status.BAD_REQUEST, ErrorMessages.AUTH.EMAIL_HAS_VERIFIED);
  }
  return user;
};

const resendVerificationEmail = async (userName: string) => {
  const user = await User.findById(userName);
  if (!user) throw new AppError(status.NOT_FOUND, ErrorMessages.USER.NOT_FOUND);
  if (user.isEmailVerified)
    throw new AppError(status.BAD_REQUEST, ErrorMessages.AUTH.EMAIL_HAS_VERIFIED);
  return sendVerificationEmail(userName, user?.email);
};

export const VerificationService = {
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
};
