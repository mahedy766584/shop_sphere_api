import type { NextFunction, Request, Response } from 'express';
import type { ZodObject, ZodRawShape } from 'zod';

import catchAsync from '../utils/catchAsync.js';

const validateRequest = <T extends ZodObject<ZodRawShape>>(schema: T) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync({
      body: req.body,
      cookies: req.cookies,
    });
    return next();
  });
};

export default validateRequest;
