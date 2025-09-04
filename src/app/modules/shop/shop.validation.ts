import { z } from 'zod';
const createShopValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500),
    location: z.string().trim(),
  }),
});

const updateShopValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).optional(),
    location: z.string().trim().optional(),
    isVerified: z.boolean().optional(),
  }),
});

export const ShopValidation = {
  createShopValidationSchema,
  updateShopValidationSchema,
};
