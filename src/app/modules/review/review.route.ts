import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';

import { upload } from '@utils/sendImageToCloudinary.js';

import { ReviewController } from './review.controller.js';
import { ReviewValidation } from './review.validation.js';

const router = Router();

router.post(
  '/create-review',
  upload.array('files', 10),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  auth(USER_ROLE.customer, USER_ROLE.seller),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReviewIntoDB,
);

router.get(
  '/:productId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  ReviewController.getProductReviews,
);

export const ReviewRoutes = router;
