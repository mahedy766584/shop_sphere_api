import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import { Router } from 'express';

import { ShopController } from './shop.controller.js';
import { ShopValidation } from './shop.validation.js';

const router = Router();

router.post(
  '/create-shop',
  auth(USER_ROLE.seller),
  validateRequest(ShopValidation.createShopValidationSchema),
  ShopController.createShopIntoDB,
);

router.patch(
  '/:shopId',
  auth(USER_ROLE.seller),
  validateRequest(ShopValidation.updateShopValidationSchema),
  ShopController.updateMyShopIntoDB,
);

router.patch(
  '/:shopId/verify',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(ShopValidation.updateShopValidationSchema),
  ShopController.verifyShopIntoDB,
);

router.delete(
  '/:shopId',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.seller),
  ShopController.softDeleteShopIntoDB,
);

router.get('/', auth(USER_ROLE.superAdmin, USER_ROLE.admin), ShopController.getAllShop);

router.get(
  '/owner',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller),
  ShopController.getShopAsOwner,
);

export const ShopRoutes = router;
