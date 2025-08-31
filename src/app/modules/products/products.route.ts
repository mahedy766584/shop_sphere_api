import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import { Router } from 'express';

import { ProductController } from './products.controller.js';
import { ProductValidation } from './products.validation.js';

const router = Router();

router.post(
  '/create-product',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.seller),
  validateRequest(ProductValidation.createProductValidationSchema),
  ProductController.createProductIntoDB,
);

export const ProductRoutes = router;
