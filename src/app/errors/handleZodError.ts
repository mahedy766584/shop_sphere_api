import type { ZodError } from 'zod';

import type { TErrorSources, TGenericErrorResponse } from '../interface/error.js';

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

  const statusCode = 400;

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  };
};

export default handleZodError;
