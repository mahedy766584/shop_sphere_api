import type mongoose from 'mongoose';

import type { TErrorSources, TGenericErrorResponse } from '../interface/error.js';

const handleCastError = (err: mongoose.Error.CastError): TGenericErrorResponse => {
  const errorSources: TErrorSources = [
    {
      path: err.path,
      message: err.message,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Invalid Id',
    errorSources,
  };
};

export default handleCastError;
