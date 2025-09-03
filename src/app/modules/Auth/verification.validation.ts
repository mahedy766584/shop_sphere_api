import { z } from 'zod';

const sendVerificationEmailSchema = z.object({
  body: z.object({
    userName: z.string().min(1, 'userName is required'),
    email: z.email('Invalid email format'),
  }),
});

const resendVerificationEmailSchema = z.object({
  body: z.object({
    userName: z.string().min(1, 'userName is required'),
  }),
});

const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
});

export const VerificationValidation = {
  sendVerificationEmailSchema,
  resendVerificationEmailSchema,
  verifyEmailSchema,
};
