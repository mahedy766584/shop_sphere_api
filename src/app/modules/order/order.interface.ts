import type { Types } from 'mongoose';

export type PaymentMethod = 'cod' | 'card' | 'mobile_banking' | 'mock' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export type TPayment = {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: string | boolean;
};

export type TShippingAddress = {
  name?: string;
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
};

export type TOrderLog = {
  at: Date;
  by?: Types.ObjectId | string;
  fromStatus?: OrderStatus | string;
  toStatus?: OrderStatus | string;
  note?: string;
};

export type TOrder = {
  user: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  priceAtAddTime: number;
  totalAmount: number;
  discountAmount?: number;
  totalDiscount?: number;
  finalAmount: number;
  currency?: string;
  status: OrderStatus;
  payment: TPayment;
  shippingAddress: TShippingAddress;
  reserved?: boolean;
  orderLogs?: TOrderLog[];
  invoiceId?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
};

export type TPayload = {
  userId: string | Types.ObjectId;
  product: string | Types.ObjectId;
  quantity: number;
  payment: TPayment;
  shippingAddress: TShippingAddress;
  discountAmount?: number;
  currency?: string;
  reserve?: boolean;
};
