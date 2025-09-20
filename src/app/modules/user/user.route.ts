import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';

import { upload } from '@utils/sendImageToCloudinary.js';

import { USER_ROLE } from './user.constant.js';
import { UserController } from './user.controller.js';
import { UserValidation } from './user.validation.js';

const router = Router();

router.post(
  '/create-user',
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(UserValidation.createUserValidationSchema),
  UserController.createUserIntoDB,
);

router.get('/', auth(USER_ROLE.superAdmin, USER_ROLE.admin), UserController.getAllUserFromDB);

router.get(
  '/get-me',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.seller),
  UserController.getMyProfile,
);

router.get('/:id', auth(USER_ROLE.superAdmin, USER_ROLE.admin), UserController.getSingleUserFromDB);

router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.seller),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateSingleUser,
);

export const UserRoutes = router;
