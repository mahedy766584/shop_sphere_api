import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectId = z.string().refine((val) => objectIdRegex.test(val), {
  message: 'Invalid MongoDB ObjectId',
});

const itemSchema = z.object({
  product: objectId,
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  priceAtAddTime: z.number().min(0, 'Price cannot be negative'),
});

const createCartValidationSchema = z.object({
  body: z.object({
    user: objectId,
    items: z.array(itemSchema).min(1, 'Cart must have at least one item'),
    totalAmount: z.number().min(0, 'Total amount cannot be negative'),
  }),
});

export const CartValidation = {
  createCartValidationSchema,
};
