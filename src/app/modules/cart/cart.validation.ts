import z from 'zod';

import { objectIdSchema } from '@utils/validators/objectIdValidator.js';

const CreateCartValidationSchema = z.object({
  body: z.object({
    product: objectIdSchema.nonempty('Product id is required'),
    quantity: z
      .number({ error: 'Quantity is required' })
      .min(1, { message: 'Quantity must be at least 1' })
      .optional(),
  }),
});

const cartQuantityValidationSchema = z.object({
  body: z.object({
    quantity: z.number({ error: 'Cart quantity is required' }),
  }),
});

export const CartValidation = {
  CreateCartValidationSchema,
  cartQuantityValidationSchema,
};
