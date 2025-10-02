import { z } from 'zod';

const createReviewValidationSchema = z.object({
  body: z.object({
    product: z.string({ message: 'Product ID is required' }),
    rating: z
      .number({ message: 'Rating is required' })
      .min(1, 'Minimum rating is 1')
      .max(5, 'Maximum rating is 5'),
    comment: z.string().optional(),
  }),
});

const updateReviewValidationSchema = z.object({
  body: z.object({
    rating: z
      .number({ message: 'Rating is required' })
      .min(1, 'Minimum rating is 1')
      .max(5, 'Maximum rating is 5')
      .optional(),
    comment: z.string().optional(),
  }),
});

export const ReviewValidation = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
};
