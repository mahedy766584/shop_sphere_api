import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import { Router } from 'express';

import { SellerProfileController } from './seller.controller.js';
import { SellerProfileValidation } from './seller.validation.js';

const router = Router();

router.post(
  '/apply-for-seller',
  auth(USER_ROLE.customer),
  validateRequest(SellerProfileValidation.createSellerProfileValidation),
  SellerProfileController.applyForSellerIntoDB,
);

router.post(
  '/reapply',
  auth(USER_ROLE.customer),
  validateRequest(SellerProfileValidation.createSellerProfileValidation),
  SellerProfileController.reApplyForSellerIntoDB,
);

router.patch(
  '/me',
  auth(USER_ROLE.seller),
  validateRequest(SellerProfileValidation.updateSellerProfileValidation),
  SellerProfileController.updateMySellerProfileIntoDB,
);

router.patch(
  '/:sellerId/status',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(SellerProfileValidation.updateSellerProfileStatusValidation),
  SellerProfileController.updateSellerStatusIntoDB,
);

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  SellerProfileController.getAllSellerFromDB,
);

router.get('/my-profile', auth(USER_ROLE.seller), SellerProfileController.getMySellerProfileFromDB);

router.delete(
  '/my-profile',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller),
  SellerProfileController.deleteMySellerProfileFromDB,
);

export const SellerProfileRoutes = router;
