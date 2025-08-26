/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextFunction, Request, Response } from 'express';
import status from 'http-status';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  return res.status(status.NOT_FOUND).json({
    success: false,
    message: 'Api not found!',
    error: '',
  });
};

export default notFound;
