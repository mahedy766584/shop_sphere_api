import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import { Router } from 'express';

import { ProductDiscountController } from './discount.controller.js';
import { ProductDiscountValidation } from './discount.validation.js';

const router = Router();

router.post(
  '/create-discount',
  auth(USER_ROLE.seller),
  validateRequest(ProductDiscountValidation.createProductDiscountSchema),
  ProductDiscountController.createProductDiscountIntoDB,
);

router.get(
  '/top-discount',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  ProductDiscountController.getTopDiscountedProducts,
);

router.patch(
  '/:discountId',
  auth(USER_ROLE.seller),
  validateRequest(ProductDiscountValidation.updateProductDiscountSchema),
  ProductDiscountController.updateProductDiscount,
);

router.delete(
  '/:discountId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller),
  ProductDiscountController.deleteProductDiscount,
);

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  ProductDiscountController.getAllDiscounts,
);

router.get(
  '/:discountId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  ProductDiscountController.getDiscountById,
);

router.get(
  '/:productId/product',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  ProductDiscountController.getDiscountsByProduct,
);

router.patch(
  '/:discountId/status',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller),
  validateRequest(ProductDiscountValidation.setDiscountStatusBodySchema),
  ProductDiscountController.setDiscountActiveStatus,
);

router.get(
  '/:productId/sync',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  ProductDiscountController.syncProductDiscountPrice,
);

export const ProductDiscountRoutes = router;
