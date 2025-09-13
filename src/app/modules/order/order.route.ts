import auth from '@middlewares/auth.js';
import validateRequest from '@middlewares/validateRequest.js';
import { USER_ROLE } from '@modules/user/user.constant.js';
import { Router } from 'express';

import { OrderController } from './order.controller.js';
import { OrderValidation } from './order.validation.js';

const router = Router();

router.post(
  '/place-order',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.seller),
  validateRequest(OrderValidation.createOrderValidationSchema),
  OrderController.createOrderIntoDB,
);

router.post(
  '/webhook/payment',
  validateRequest(OrderValidation.paymentWebhookSchema),
  OrderController.paymentWebhook,
);

router.post(
  '/:id/ship',
  validateRequest(OrderValidation.shipOrderSchema),
  auth(USER_ROLE.seller),
  OrderController.shipOrder,
);

router.post(
  '/:id/deliver',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.seller),
  validateRequest(OrderValidation.orderIdParamSchema),
  OrderController.deliverOrder,
);

router.post('/:id/cancel', auth(USER_ROLE.customer), OrderController.cancelOrder);

export const OrderRoutes = router;
