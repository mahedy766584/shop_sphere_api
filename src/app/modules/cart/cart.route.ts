import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import { Router } from 'express';

import { CartController } from './cart.controller.js';
import { CartValidation } from './cart.validation.js';

const router = Router();

router.post(
  '/add-cart',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  validateRequest(CartValidation.addCartValidationSchema),
  CartController.addItemToCart,
);

router.patch(
  '/update-quantity',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  validateRequest(CartValidation.removeItemCartQuantityValidationSchema),
  CartController.removeItemCartQuantity,
);

router.delete(
  '/:productId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  CartController.removeItemFromCart,
);

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  CartController.getMyCart,
);

router.delete(
  '/clear',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  CartController.clearCart,
);

export const CartRoutes = router;
