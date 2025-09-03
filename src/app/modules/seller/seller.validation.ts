import { z } from 'zod';

// 1️⃣ Create SellerProfile (User apply)
const createSellerProfileValidation = z.object({
  body: z.object({
    businessName: z
      .string()
      .min(2, 'Business name must be at least 2 characters')
      .max(200, 'Business name too long')
      .trim(),
    tradeLicense: z.string().min(3, 'Trade license is required').max(100),
    bankAccount: z.string().min(6, 'Bank account must be at least 6 characters').max(100),
    documents: z.array(z.url('Document must be a valid URL')).optional(),
  }),
});

// 2️⃣ Update SellerProfile (Partial update allowed)
const updateSellerProfileValidation = z.object({
  body: z
    .object({
      businessName: z.string().min(2).max(200).trim().optional(),
      tradeLicense: z.string().min(3).max(100).optional(),
      bankAccount: z.string().min(6).max(100).optional(),
      documents: z.array(z.url()).optional(),
    })
    .partial(),
});

// 3️⃣ Admin updates status
const updateSellerProfileStatusValidation = z.object({
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected']),
  }),
});

export const SellerProfileValidation = {
  createSellerProfileValidation,
  updateSellerProfileValidation,
  updateSellerProfileStatusValidation,
};
