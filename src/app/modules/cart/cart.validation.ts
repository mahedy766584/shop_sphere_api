import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().refine((val) => objectIdRegex.test(val), {
  message: 'Invalid MongoDB ObjectId',
});

const itemSchema = z.object({
  product: objectId,
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

const addCartValidationSchema = z.object({
  body: z.object({
    items: z
      .union([itemSchema, z.array(itemSchema)])
      .refine(
        (val) => (Array.isArray(val) ? val.length > 0 : true),
        'Cart must have at least one item',
      ),
  }),
});

const removeItemCartQuantityValidationSchema = z.object({
  body: z.object({
    productId: objectId,
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
});

export const CartValidation = {
  addCartValidationSchema,
  removeItemCartQuantityValidationSchema,
};
