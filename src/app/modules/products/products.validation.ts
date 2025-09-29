import { z } from 'zod';

import { objectIdSchema } from '@utils/validators/objectIdValidator.js';

// 🔹 Attribute Validation
const attributeValidationSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, 'Attribute key must be at least 2 characters long')
    .max(50, 'Attribute key cannot exceed 50 characters')
    .nonempty('Attribute key is required'),

  value: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Attribute value must have at least 1 character')
        .max(50, 'Attribute value cannot exceed 50 characters'),
    )
    .nonempty('Attribute must have at least one value'),
});

// 🔹 Create Product Validation
const createProductValidationSchema = z
  .object({
    body: z.object({
      name: z
        .string()
        .trim()
        .min(3, 'Product name must be at least 3 characters long')
        .max(100, 'Product name cannot exceed 100 characters')
        .nonempty('Product name is required'),

      slug: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, 'Slug must be at least 3 characters long')
        .max(120, 'Slug cannot exceed 120 characters')
        .nonempty('Slug is required')
        .optional(),

      description: z
        .string()
        .min(10, 'Description must be at least 10 characters long')
        .max(2000, 'Description cannot exceed 2000 characters')
        .nonempty('Product description is required'),

      price: z.number().nonnegative('Price cannot be negative'),

      discountPrice: z.number().nonnegative('Discount price cannot be negative').optional(),

      sku: z
        .string()
        .trim()
        .min(3, 'SKU must be at least 3 characters long')
        .max(50, 'SKU cannot exceed 50 characters')
        .nonempty('SKU is required'),

      stock: z.number().nonnegative('Stock cannot be negative'),

      images: z.array(z.string().trim()).nonempty('At least one image is required').optional(),

      brand: z
        .string()
        .trim()
        .min(2, 'Brand name must be at least 2 characters long')
        .max(50, 'Brand name cannot exceed 50 characters')
        .optional(),

      category: objectIdSchema.nonempty('Category is required'),

      attributes: z.array(attributeValidationSchema).optional(),

      averageRating: z
        .number()
        .min(0, 'Rating cannot be below 0')
        .max(5, 'Rating cannot be above 5')
        .default(0),

      isFeatured: z.boolean().default(false),
      isActive: z.boolean().optional(),
    }),
  })
  // 🔹 discountPrice < price validation
  .refine((data) => !data.body.discountPrice || data.body.discountPrice < data.body.price, {
    message: 'Discount price must be less than the original price',
    path: ['body', 'discountPrice'],
  });

const updateProductValidationSchema = z
  .object({
    // 🔹 Scalar fields
    name: z
      .string({
        error: 'Product name is required',
      })
      .min(1, { message: 'Product name cannot be empty' })
      .max(255, { message: 'Product name must not exceed 255 characters' })
      .optional(),

    description: z
      .string({
        error: 'Description must be a string',
      })
      .max(2000, { message: 'Description must not exceed 2000 characters' })
      .optional(),

    price: z
      .number({
        error: 'Price must be a number',
      })
      .positive({ message: 'Price must be greater than 0' })
      .optional(),

    discountPrice: z
      .number({
        error: 'Discount price must be a number',
      })
      .positive({ message: 'Discount price must be greater than 0' })
      .optional(),

    sku: z
      .string({
        error: 'SKU must be a string',
      })
      .optional(),

    stock: z
      .number({
        error: 'Stock must be a number',
      })
      .int({ message: 'Stock must be an integer' })
      .min(0, { message: 'Stock cannot be negative' })
      .optional(),

    brand: z
      .string({
        error: 'Brand must be a string',
      })
      .optional(),

    isFeatured: z
      .boolean({
        error: 'isFeatured must be a boolean',
      })
      .optional(),

    isActive: z
      .boolean({
        error: 'isActive must be a boolean',
      })
      .optional(),

    category: objectIdSchema.nonempty('Category is required').optional(),

    // 🔹 Attributes: add / update / remove
    attributes: z
      .object({
        add: z
          .array(
            z.object({
              key: z.string().min(1, { message: 'Attribute key cannot be empty' }),
              value: z
                .array(
                  z.string().min(1, {
                    message: 'Attribute value cannot be empty',
                  }),
                )
                .min(1, { message: 'At least one value is required' }),
            }),
          )
          .optional(),

        update: z
          .array(
            z.object({
              key: z.string().min(1, { message: 'Attribute key cannot be empty' }),
              value: z
                .array(
                  z.string().min(1, {
                    message: 'Attribute value cannot be empty',
                  }),
                )
                .min(1, { message: 'At least one value is required' }),
            }),
          )
          .optional(),

        remove: z.array(z.string().min(1, { message: 'Attribute key cannot be empty' })).optional(),
      })
      .optional(),

    // 🔹 Images: remove URLs only; uploads come via files (Multer)
    images: z
      .object({
        remove: z.array(z.string().url({ message: 'Each image must be a valid URL' })).optional(),
      })
      .optional(),
  })
  .refine((data) => !(data.discountPrice && data.price && data.discountPrice >= data.price), {
    message: 'Discount price must be less than the original price',
    path: ['discountPrice'],
  });

export const ProductValidation = {
  createProductValidationSchema,
  updateProductValidationSchema,
};
