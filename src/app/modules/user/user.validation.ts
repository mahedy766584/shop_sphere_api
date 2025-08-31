import { z } from 'zod';

// Name Validation
const nameValidationSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(20, 'First name must not exceed 20 characters')
    .trim()
    .refine((value) => /^[A-Z]/.test(value), {
      message: 'First Name must start with a capital letter',
    }),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(20, 'Last name must not exceed 20 characters')
    .trim(),
});

// Address Validation
const addressValidationSchema = z.object({
  type: z.enum(['home', 'office', 'other']),
  street: z.string().trim(),
  state: z.string().trim(),
  postalCode: z.string().trim(),
  country: z.string().trim(),
  isDefault: z.boolean().default(false),
});

// User Validation
export const userValidationSchema = z.object({
  body: z.object({
    name: nameValidationSchema,
    userName: z
      .string()
      .min(4, 'Username must be at least 4 characters')
      .max(30, 'Username must not exceed 30 characters')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(8, 'Password must not exceed 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[\W_]/, 'Password must contain at least one special character'),
    email: z.email({ message: 'Please provide a valid email address' }).toLowerCase().trim(),
    role: z.enum(['superAdmin', 'admin', 'seller', 'customer']).default('customer').optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
      .optional(),
    address: addressValidationSchema.optional(),
    profileImage: z.url('Profile image must be a valid URL').default('https://ibb.co/jkx7zn2'),
  }),
});

export const UserValidation = {
  userValidationSchema,
};
