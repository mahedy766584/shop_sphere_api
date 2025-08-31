import { z } from 'zod';

const loginValidationSchema = z.object({
  body: z.object({
    userName: z
      .string()
      .min(1, 'Username is required!')
      .max(30, 'Username must be at most 30 characters')
      .trim(),

    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(8, 'Password must not exceed 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[\W_]/, 'Password must contain at least one special character'),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must be at most 50 characters')
      .trim(),

    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(8, 'Password must not exceed 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[\W_]/, 'Password must contain at least one special character'),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string(),
  }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    userName: z
      .string()
      .min(4, 'Username is required!')
      .max(15, 'Username must be at most 30 characters')
      .trim(),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    userName: z
      .string()
      .min(4, 'Username is required!')
      .max(15, 'Username must be at most 30 characters')
      .trim(),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(8, 'Password must not exceed 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[\W_]/, 'Password must contain at least one special character'),
  }),
});

export const AuthValidation = {
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
};
