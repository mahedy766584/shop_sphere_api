import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';

import { upload } from '@utils/file/sendImageToCloudinary.js';

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
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReviewIntoDB,
);

router.get(
  '/:productId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  ReviewController.getProductReviews,
);

router.get(
  '/:reviewId/review',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  ReviewController.getReviewById,
);

router.get(
  '/:productId/reviews',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  ReviewController.getProductReviewDetails,
);

router.put(
  '/:reviewId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  upload.array('files', 10),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  validateRequest(ReviewValidation.updateReviewValidationSchema),
  ReviewController.updateReview,
);

router.delete(
  '/:reviewId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.seller, USER_ROLE.customer),
  ReviewController.deleteReview,
);

export const ReviewRoutes = router;
