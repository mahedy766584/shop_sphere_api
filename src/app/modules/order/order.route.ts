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
  '/payment/stripe',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.seller),
  validateRequest(OrderValidation.createStripePaymentSchema),
  OrderController.createStripePayment,
);

router.post(
  '/webhook/payment',
  validateRequest(OrderValidation.paymentWebhookSchema),
  OrderController.confirmPayment,
);

router.post(
  '/:orderId/ship',
  validateRequest(OrderValidation.shipOrderSchema),
  auth(USER_ROLE.seller),
  OrderController.shipOrder,
);

router.post(
  '/:orderId/deliver',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.seller),
  OrderController.deliverOrder,
);

router.post('/:invoiceId/cancel', auth(USER_ROLE.customer), OrderController.cancelOrder);

export const OrderRoutes = router;
