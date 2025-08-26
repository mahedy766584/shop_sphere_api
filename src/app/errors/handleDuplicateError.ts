/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TErrorSources, TGenericErrorResponse } from '../interface/error.js';

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const fieldName = Object.keys(err.keyPattern)[0];
  const value = err.keyValue[fieldName];

  const errorSources: TErrorSources = [
    {
      path: fieldName,
      message: `${fieldName} '${value}' is already exits!`,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Duplicate Error',
    errorSources,
  };
};

export default handleDuplicateError;
