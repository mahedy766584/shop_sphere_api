export const normalizeDate = (date: Date | string): Date => {
  return date instanceof Date ? date : new Date(date);
};
