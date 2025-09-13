export const OrderStatus = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
] as const;

export const PaymentMethods = [
  'cod',
  'card',
  'mobile_banking',
  'mock',
  'cash_on_delivery',
] as const;

export const PaymentStatus = ['pending', 'paid', 'failed', 'refunded'] as const;
