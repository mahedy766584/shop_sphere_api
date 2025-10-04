import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import { Router } from 'express';

import { CouponController } from './coupon.controller.js';
import { CouponValidation } from './coupon.validation.js';

const router = Router();

router.post(
  '/create-coupon',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller),
  validateRequest(CouponValidation.createCouponValidationSchema),
  CouponController.createCouponIntoDB,
);

router.post(
  '/apply',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  validateRequest(CouponValidation.applyCouponValidation),
  CouponController.applyCoupon,
);

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  CouponController.getAllCouponsFromDB,
);

router.get(
  '/active',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  CouponController.getActiveCoupons,
);

router.patch(
  '/:couponId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  validateRequest(CouponValidation.updateCouponValidationSchema),
  CouponController.updateCouponIntoDB,
);

router.delete(
  '/:couponId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  CouponController.deleteCoupon,
);

export const CouponRoutes = router;
