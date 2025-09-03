import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import { Router } from 'express';

import { AuthController } from './auth.controller.js';
import { AuthValidation } from './auth.validation.js';
import { VerificationController } from './verification.controller.js';
import { VerificationValidation } from './verification.validation.js';

const router = Router();
router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginUser,
);

router.post(
  '/change-password',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.customer, USER_ROLE.seller),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword,
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshToken,
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthController.forgetPassword,
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword,
);

router.post(
  '/send-verification',
  validateRequest(VerificationValidation.sendVerificationEmailSchema),
  VerificationController.sendVerificationEmail,
);

router.get(
  '/verify-email',
  validateRequest(VerificationValidation.verifyEmailSchema),
  VerificationController.verifyEmail,
);

router.post(
  '/resend-verification',
  validateRequest(VerificationValidation.resendVerificationEmailSchema),
  VerificationController.resendVerificationEmail,
);

export const AuthRoutes = router;
