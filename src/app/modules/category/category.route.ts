import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import { Router } from 'express';

import { CategoryController } from './category.controller.js';
import { CategoryValidation } from './category.validation.js';

const router = Router();

router.post(
  '/create-category',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(CategoryValidation.createCategorySchema),
  CategoryController.createCategoryIntoDB,
);

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.seller),
  CategoryController.getAllCategories,
);
router.get(
  '/active',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.seller),
  CategoryController.getActiveCategories,
);

router.get(
  '/tree',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.seller),
  CategoryController.buildCategoryTree,
);

router.get(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  CategoryController.getSingleCategory,
);

router.get(
  '/:id/child',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.seller),
  CategoryController.getChildCategories,
);

router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  CategoryController.updateSingleCategory,
);

router.patch(
  '/:id/status',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(CategoryValidation.toggleCategoryStatus),
  CategoryController.toggleCategoryStatus,
);

router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  CategoryController.deleteCategory,
);

export const CategoryRoutes = router;
