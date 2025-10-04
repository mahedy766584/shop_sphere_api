import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import { Router } from 'express';

import { CartController } from './cart.controller.js';
import { CartValidation } from './cart.validation.js';

const route = Router();

route.post(
  '/add-to-cart',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  validateRequest(CartValidation.CreateCartValidationSchema),
  CartController.addProductInCart,
);

route.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  CartController.getUserCart,
);

route.patch(
  '/:cartId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  validateRequest(CartValidation.cartQuantityValidationSchema),
  CartController.updateCartQuantity,
);

route.delete(
  '/:cartId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  CartController.deleteSingleCart,
);

export const CartRoutes = route;
