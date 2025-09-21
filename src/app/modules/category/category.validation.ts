import { boolean, z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({
        error: 'Category name is required',
      })
      .min(2, 'Category name must be at least 2 characters')
      .max(100, 'Category name cannot exceed 100 characters')
      .trim(),

    parent: z
      .string({
        error: 'Parent must be a MongoDB ObjectId string',
      })
      .regex(objectIdRegex, 'Parent must be a valid MongoDB ObjectId')
      .optional()
      .nullable(),

    isActive: z
      .boolean({
        error: 'isActive must be a boolean',
      })
      .optional()
      .default(true),
  }),
});

const updateCategorySchema = z
  .object({
    body: z.object({
      name: z
        .string({
          error: 'Category name must be a string',
        })
        .min(2, 'Category name must be at least 2 characters')
        .max(100, 'Category name cannot exceed 100 characters')
        .trim()
        .optional(),

      parent: z
        .string({
          error: 'Parent must be a MongoDB ObjectId string',
        })
        .regex(objectIdRegex, 'Parent must be a valid MongoDB ObjectId')
        .optional()
        .nullable(),

      isActive: z
        .boolean({
          error: 'isActive must be a boolean',
        })
        .optional(),
    }),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

const toggleCategoryStatus = z.object({
  body: z.object({
    isActive: boolean({ error: 'Is active field is required!' }),
  }),
});

export const CategoryValidation = {
  createCategorySchema,
  updateCategorySchema,
  toggleCategoryStatus,
};
