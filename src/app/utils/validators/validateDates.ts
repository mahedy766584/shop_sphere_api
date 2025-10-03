import status from 'http-status';

import AppError from '@errors/appError.js';

export const validateDates = (startDate: Date, endDate: Date) => {
  const now = new Date();
  const newStartDate = new Date(startDate);
  const newEndDate = new Date(endDate);

  if (newStartDate >= newEndDate) {
    throw new AppError(status.BAD_REQUEST, 'Start date must be before end date.');
  }

  if (newStartDate < now) {
    throw new AppError(status.BAD_REQUEST, 'Start date cannot be in the past.');
  }
};
