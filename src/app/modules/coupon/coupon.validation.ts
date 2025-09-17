import { z } from 'zod';

const createCouponValidationSchema = z
  .object({
    body: z.object({
      code: z
        .string({ message: 'Coupon code must be a string' })
        .trim()
        .min(3, { message: 'Coupon code must be at least 3 characters' })
        .max(20, { message: 'Coupon code cannot exceed 20 characters' })
        .transform((s) => s.toUpperCase()),

      discountType: z.enum(['percentage', 'flat'], {
        message: 'Discount type must be "percentage" or "flat"',
      }),

      discountValue: z
        .number({ message: 'Discount value must be a number' })
        .min(0.01, { message: 'Discount value must be greater than 0' }),

      minPurchase: z
        .number({ message: 'minPurchase must be a number' })
        .min(0, { message: 'Minimum purchase must be a non-negative number' })
        .optional(),

      maxDiscount: z
        .number({ message: 'maxDiscount must be a number' })
        .min(0.01, { message: 'Max discount must be greater than 0' })
        .optional(),

      startDate: z.coerce.date({ message: 'Start date must be a valid date' }),
      endDate: z.coerce.date({ message: 'End date must be a valid date' }),

      isActive: z.boolean({ message: 'isActive must be a boolean' }).optional().default(true),
    }),
  })
  .superRefine((data, ctx) => {
    const body = data.body;

    // startDate < endDate
    if (body.startDate && body.endDate && +body.endDate <= +body.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['body', 'endDate'],
        message: 'End date must be after start date',
      });
    }

    // If percentage type
    if (body.discountType === 'percentage') {
      if (body.discountValue > 100) {
        ctx.addIssue({
          code: 'custom',
          path: ['body', 'discountValue'],
          message: 'For percentage discount, discountValue cannot exceed 100',
        });
      }

      if (body.maxDiscount === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['body', 'maxDiscount'],
          message: 'maxDiscount is required when discountType is "percentage"',
        });
      } else if (body.maxDiscount <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['body', 'maxDiscount'],
          message: 'maxDiscount must be greater than 0',
        });
      }
    }
  });

const updateCouponValidationSchema = z
  .object({
    body: z.object({
      code: z
        .string({ message: 'Coupon code must be a string' })
        .trim()
        .min(3, { message: 'Coupon code must be at least 3 characters' })
        .max(20, { message: 'Coupon code cannot exceed 20 characters' })
        .transform((s) => s.toUpperCase())
        .optional(),

      discountType: z
        .enum(['percentage', 'flat'], {
          message: 'Discount type must be "percentage" or "flat"',
        })
        .optional(),

      discountValue: z
        .number({ message: 'Discount value must be a number' })
        .min(0.01, { message: 'Discount value must be greater than 0' })
        .optional(),

      minPurchase: z
        .number({ message: 'minPurchase must be a number' })
        .min(0, { message: 'Minimum purchase must be a non-negative number' })
        .optional(),

      maxDiscount: z
        .number({ message: 'maxDiscount must be a number' })
        .min(0.01, { message: 'Max discount must be greater than 0' })
        .optional(),

      startDate: z.coerce.date({ message: 'Start date must be a valid date' }).optional(),
      endDate: z.coerce.date({ message: 'End date must be a valid date' }).optional(),

      isActive: z.boolean({ message: 'isActive must be a boolean' }).optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const body = data.body;

    // ✅ startDate < endDate
    if (body.startDate && body.endDate && +body.endDate <= +body.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['body', 'endDate'],
        message: 'End date must be after start date',
      });
    }

    // ✅ If percentage type
    if (body.discountType === 'percentage') {
      if (body.discountValue && body.discountValue > 100) {
        ctx.addIssue({
          code: 'custom',
          path: ['body', 'discountValue'],
          message: 'For percentage discount, discountValue cannot exceed 100',
        });
      }

      if (body.maxDiscount === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['body', 'maxDiscount'],
          message: 'maxDiscount is required when discountType is "percentage"',
        });
      } else if (body.maxDiscount <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['body', 'maxDiscount'],
          message: 'maxDiscount must be greater than 0',
        });
      }
    }
  });

export const CouponValidation = {
  createCouponValidationSchema,
  updateCouponValidationSchema,
};
