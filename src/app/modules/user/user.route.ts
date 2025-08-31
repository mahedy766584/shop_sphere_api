import validateRequest from '@middlewares/validateRequest.js';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';

import { upload } from '@utils/sendImageToCloudinary.js';

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
  validateRequest(UserValidation.userValidationSchema),
  UserController.createUserIntoDB,
);

router.get('/', UserController.getAllUserFromDB);

router.get('/:id', UserController.getSingleUserFromDB);

export const UserRoutes = router;
