import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';

import { upload } from '@utils/file/sendImageToCloudinary.js';

import { ProductController } from './products.controller.js';
import { ProductValidation } from './products.validation.js';

const router = Router();

router.post(
  '/create-product/:shopId',
  upload.array('files', 10),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller),
  validateRequest(ProductValidation.createProductValidationSchema),
  ProductController.createProductIntoDB,
);

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  ProductController.getAllProductsFromDB,
);

router.get(
  '/:productId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  ProductController.getSingleProductFromDB,
);

router.put(
  '/:productId',
  upload.array('files', 10),
  (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller),
  validateRequest(ProductValidation.updateProductValidationSchema),
  ProductController.updateProductIntoDB,
);

export const ProductRoutes = router;
