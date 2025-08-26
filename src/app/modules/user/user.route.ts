import { Router } from 'express';

import validateRequest from '../../middlewares/validateRequest.js';

import { UserController } from './user.controller.js';
import { UserValidation } from './user.validation.js';

const router = Router();

router.post(
  '/create-user',
  validateRequest(UserValidation.userValidationSchema),
  UserController.createUserIntoDB,
);

router.get('/', UserController.getAllUserFromDB);

router.get('/:id', UserController.getSingleUserFromDB);

export const UserRoutes = router;
