import { Types } from 'mongoose';
import { z } from 'zod';

const createProductDiscountSchema = z.object({
  body: z
    .object({
      productId: z
        .string()
        .refine((val) => Types.ObjectId.isValid(val), { message: 'Invalid product ID' }),

      discountType: z.enum(['percentage', 'flat'], {
        message: 'Discount type must be either "percentage" or "flat"',
      }),

      discountValue: z
        .number()
        .refine((val) => val >= 0, { message: 'Discount value cannot be negative' }),

      startDate: z.preprocess(
        (val) => {
          if (typeof val === 'string' || typeof val === 'number' || val instanceof Date) {
            return new Date(val);
          }
          return undefined;
        },
        z.date({ error: 'Start date must be a valid date' }),
      ),

      endDate: z.preprocess(
        (val) => {
          if (typeof val === 'string' || typeof val === 'number' || val instanceof Date) {
            return new Date(val);
          }
          return undefined;
        },
        z.date({ error: 'End date must be a valid date' }),
      ),

      isActive: z.boolean().optional().default(true),
    })
    .refine((data) => data.endDate > data.startDate, {
      message: 'End date must be after start date',
      path: ['endDate'],
    }),
});

const updateProductDiscountSchema = z.object({
  body: z
    .object({
      productId: z
        .string()
        .refine((val) => Types.ObjectId.isValid(val), { message: 'Invalid product ID' })
        .optional(),

      discountType: z
        .enum(['percentage', 'flat'], {
          message: 'Discount type must be either "percentage" or "flat"',
        })
        .optional(),

      discountValue: z
        .number()
        .refine((val) => val >= 0, { message: 'Discount value cannot be negative' })
        .optional(),

      startDate: z
        .preprocess(
          (val) => {
            if (typeof val === 'string' || typeof val === 'number' || val instanceof Date) {
              return new Date(val);
            }
            return undefined;
          },
          z.date({ error: 'Start date must be a valid date' }),
        )
        .optional(),

      endDate: z
        .preprocess(
          (val) => {
            if (typeof val === 'string' || typeof val === 'number' || val instanceof Date) {
              return new Date(val);
            }
            return undefined;
          },
          z.date({ error: 'End date must be a valid date' }),
        )
        .optional(),

      isActive: z.boolean().optional().default(true),
    })
    .refine(
      (data) => {
        if (!data.startDate || !data.endDate) return true;
        return data.endDate > data.startDate;
      },
      {
        message: 'End date must be after start date',
        path: ['endDate'],
      },
    ),
});

const setDiscountStatusBodySchema = z.object({
  body: z.object({
    isActive: z.boolean({
      error: 'isActive must be a boolean',
    }),
  }),
});

export const ProductDiscountValidation = {
  createProductDiscountSchema,
  updateProductDiscountSchema,
  setDiscountStatusBodySchema,
};
