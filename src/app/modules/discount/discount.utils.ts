import { ProductDiscount } from './discount.model.js';

export const getBestActiveDiscountForProduct = async (productId: string) => {
  const now = new Date();
  return await ProductDiscount.findOne({
    productId,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ discountValue: -1 });
};
