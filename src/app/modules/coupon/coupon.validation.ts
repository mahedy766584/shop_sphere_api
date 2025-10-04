import { z } from 'zod';

import { objectIdSchema } from '@utils/validators/objectIdValidator.js';

import { couponType } from './coupon.constant.js';

const createCouponValidationSchema = z
  .object({
    body: z.object({
      code: z
        .string()
        .min(3, { message: 'Coupon code must be at least 3 characters' })
        .max(20, { message: 'Coupon code cannot exceed 20 characters' })
        .optional(),
      couponType: z
        .enum(couponType, {
          message: 'Coupon type must be one of: flat, percentage, free_shipping, bxgy',
        })
        .optional(),
      couponValue: z.number().optional(),
      minOrderAmount: z
        .number()
        .positive({ message: 'Minimum order amount must be greater than 0' })
        .optional(),
      maxCouponAmount: z
        .number()
        .positive({ message: 'Maximum discount amount must be greater than 0' })
        .optional(),
      usageLimit: z
        .number()
        .int({ message: 'Usage limit must be an integer' })
        .positive({ message: 'Usage limit must be greater than 0' })
        .optional(),
      perUserLimit: z
        .number()
        .int({ message: 'Per-user limit must be an integer' })
        .positive({ message: 'Per-user limit must be greater than 0' })
        .optional(),
      startDate: z
        .preprocess(
          (val) => {
            if (!val) return undefined;
            const d = new Date(val as string);
            return isNaN(d.getTime()) ? undefined : d;
          },
          z.date({ error: 'Invalid start date format' }),
        )
        .optional(),
      endDate: z
        .preprocess(
          (val) => {
            if (!val) return undefined;
            const d = new Date(val as string);
            return isNaN(d.getTime()) ? undefined : d;
          },
          z.date({ error: 'Invalid end date format' }),
        )
        .optional(),
      shop: objectIdSchema.nonempty('Shop is is required'),
      isActive: z.boolean().optional(),
    }),
  })
  .refine(
    (data) => !data.body.startDate || !data.body.endDate || data.body.startDate < data.body.endDate,
    { message: 'End date must be after start date', path: ['body', 'endDate'] },
  )
  .refine(
    (data) =>
      data.body.couponType !== 'percentage' ||
      data.body.couponValue === undefined ||
      (data.body.couponValue > 0 && data.body.couponValue <= 100),
    { message: 'Percentage discount must be between 1 and 100', path: ['body', 'couponValue'] },
  )
  .refine(
    (data) =>
      data.body.couponType !== 'flat' ||
      data.body.couponValue === undefined ||
      data.body.couponValue > 0,
    { message: 'Flat discount must be greater than 0', path: ['body', 'couponValue'] },
  );

const updateCouponValidationSchema = z
  .object({
    body: z.object({
      code: z
        .string()
        .min(3, { message: 'Coupon code must be at least 3 characters' })
        .max(20, { message: 'Coupon code cannot exceed 20 characters' })
        .optional(),

      type: z
        .enum(couponType, {
          message: 'Coupon type must be one of: flat, percentage, free_shipping, bxgy',
        })
        .optional(),

      discountValue: z.number().optional(),

      minOrderAmount: z
        .number()
        .positive({ message: 'Minimum order amount must be greater than 0' })
        .optional(),

      maxDiscountAmount: z
        .number()
        .positive({
          message: 'Maximum discount amount must be greater than 0',
        })
        .optional(),

      usageLimit: z
        .number()
        .int({ message: 'Usage limit must be an integer' })
        .positive({ message: 'Usage limit must be greater than 0' })
        .optional(),

      perUserLimit: z
        .number()
        .int({ message: 'Per-user limit must be an integer' })
        .positive({ message: 'Per-user limit must be greater than 0' })
        .optional(),

      startDate: z
        .preprocess(
          (val) => {
            const d = new Date(val as string);
            return isNaN(d.getTime()) ? undefined : d;
          },
          z.date({ error: 'Start date must be a valid date' }),
        )
        .optional(),

      endDate: z
        .preprocess(
          (val) => {
            const d = new Date(val as string);
            return isNaN(d.getTime()) ? undefined : d;
          },
          z.date({ error: 'End date must be a valid date' }),
        )
        .optional(),

      isActive: z.boolean().optional(),
    }),
  })
  .refine(
    (data) =>
      !(data.body.startDate && data.body.endDate) || data.body.startDate < data.body.endDate,
    {
      message: 'End date must be after start date',
      path: ['body', 'endDate'],
    },
  )
  // Percentage discount validation
  .refine(
    (data) =>
      data.body.type !== 'percentage' ||
      data.body.discountValue === undefined ||
      (data.body.discountValue > 0 && data.body.discountValue <= 100),
    {
      message: 'Percentage discount must be between 1 and 100',
      path: ['body', 'discountValue'],
    },
  )
  // Flat discount validation
  .refine(
    (data) =>
      data.body.type !== 'flat' ||
      data.body.discountValue === undefined ||
      data.body.discountValue > 0,
    {
      message: 'Flat discount must be greater than 0',
      path: ['body', 'discountValue'],
    },
  );

const applyCouponValidation = z.object({
  body: z.object({
    code: z
      .string({
        error: 'Coupon code is required',
      })
      .trim()
      .min(3, { message: 'Coupon code must be at least 3 characters long' })
      .max(20, { message: 'Coupon code cannot exceed 20 characters' }),

    orderAmount: z
      .number({
        error: 'Order amount is required',
      })
      .positive({ message: 'Order amount must be greater than 0' })
      .max(1000000, { message: 'Order amount cannot exceed 1,000,000' }),
  }),
});

export const CouponValidation = {
  createCouponValidationSchema,
  updateCouponValidationSchema,
  applyCouponValidation,
};
