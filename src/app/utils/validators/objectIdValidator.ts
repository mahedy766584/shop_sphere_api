import mongoose from 'mongoose';
import { z } from 'zod';

export const objectIdSchema = z
  .string({
    error: 'Category is required',
  })
  .min(1, 'Category is required')
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid MongoDB ObjectId',
  });

export const validateObjectId = (id: string) => {
  return objectIdSchema.parse(id);
};
