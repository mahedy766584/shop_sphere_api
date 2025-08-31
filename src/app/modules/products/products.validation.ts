import { z } from 'zod';

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
        .nonempty('Slug is required'),

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

      images: z.array(z.string().trim()).nonempty('At least one image is required'),

      brand: z
        .string()
        .trim()
        .min(2, 'Brand name must be at least 2 characters long')
        .max(50, 'Brand name cannot exceed 50 characters')
        .optional(),

      attributes: z.array(attributeValidationSchema).optional(),

      averageRating: z
        .number()
        .min(0, 'Rating cannot be below 0')
        .max(5, 'Rating cannot be above 5')
        .default(0),

      isFeatured: z.boolean().default(false),
      isActive: z.boolean().default(true),
    }),
  })
  // 🔹 discountPrice < price validation
  .refine((data) => !data.body.discountPrice || data.body.discountPrice < data.body.price, {
    message: 'Discount price must be less than the original price',
    path: ['body', 'discountPrice'],
  });

// 🔹 Update Product Validation (Partial)
const updateProductValidationSchema = z.object({
  body: createProductValidationSchema.shape.body.partial(),
});

export const ProductValidation = {
  createProductValidationSchema,
  updateProductValidationSchema,
};
