import { z } from 'zod';

import { PaymentMethods, PaymentStatus } from './order.constant.js';

const createOrderValidationSchema = z.object({
  body: z.object({
    product: z.string({ message: 'Product ID is required.' }),
    quantity: z
      .number({ message: 'Quantity is required.' })
      .int()
      .min(1, { message: 'Quantity >= 1' }),
    payment: z.object({
      method: z.enum(PaymentMethods, { message: 'Invalid payment method.' }),
      status: z
        .enum(PaymentStatus, { message: 'Invalid payment status.' })
        .optional()
        .default('pending'),
    }),
    shippingAddress: z.object({
      name: z.string().optional(),
      street: z.string({ message: 'Street is required.' }),
      city: z.string({ message: 'City is required.' }),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string({ message: 'Country is required.' }),
      phone: z.string().optional(),
    }),
    discountAmount: z.number().min(0).optional().default(0),
    currency: z.string().optional().default('BDT'),
    reserve: z.boolean().optional().default(true),
  }),
});

const paymentWebhookSchema = z.object({
  body: z.object({
    orderId: z.string().min(1),
    transactionId: z.string().min(1),
    status: z.enum(['success', 'failed']),
    gatewayResponse: z.any(),
  }),
});

const shipOrderSchema = z.object({
  body: z.object({
    shipmentId: z.string().min(1),
  }),
});

const orderIdParamSchema = z.object({
  body: z.object({
    id: z.string().min(1),
  }),
});

export const OrderValidation = {
  createOrderValidationSchema,
  paymentWebhookSchema,
  shipOrderSchema,
  orderIdParamSchema,
};
