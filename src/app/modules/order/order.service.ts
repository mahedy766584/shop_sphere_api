/* eslint-disable @typescript-eslint/no-explicit-any */
import { Product } from '@modules/products/products.model.js';
import status from 'http-status';
import { Types } from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import { withTransaction } from '@utils/db/withTransaction.js';
import { checkUserStatus } from '@utils/guards/checkUserStatus.js';

import type { TOrder } from './order.interface.js';
import { Order } from './order.model.js';
import { stripe } from './order.utils.js';

const createOrderIntoDB = async (userId: string, payload: TOrder) => {
  return withTransaction(async (session) => {
    const user = await checkUserStatus(userId, session);

    const product = await Product.findById(payload.product).session(session);
    if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

    const quantity = Number(payload.quantity);

    if (product.stock < quantity) {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.PRODUCT.QUANTITY_EXCEEDS(product.stock));
    }

    const priceAtAddTime = product.price;
    const perItemDiscount = product.discountPrice || 0;
    const totalAmount = priceAtAddTime * quantity;
    const totalDiscount = perItemDiscount * quantity;
    const finalAmount = Math.max(0, totalAmount - totalDiscount);

    const orderData: TOrder = {
      user: new Types.ObjectId(user?._id),
      product: new Types.ObjectId(product._id),
      quantity: payload.quantity,
      priceAtAddTime,
      totalAmount,
      discountAmount: perItemDiscount,
      totalDiscount,
      finalAmount,
      currency: payload.currency || 'BDT',
      status: 'pending',
      payment: { method: payload.payment.method, status: 'pending' },
      shippingAddress: payload.shippingAddress,
      orderLogs: [
        {
          at: new Date(),
          by: new Types.ObjectId(userId),
          toStatus: 'pending',
          note: 'Order created (reserved)',
        },
      ],
    };

    const [orderDoc] = await Order.create([orderData], { session });

    if (orderDoc) {
      await Product.updateOne(
        { _id: product._id, stock: { $gte: payload.quantity } },
        { $inc: { stock: -payload.quantity } },
      ).session(session);
    }

    return orderDoc;
  });
};

const createStripePayment = async (invoiceId: string, userId: string) => {
  const order = await Order.findOne({ invoiceId: invoiceId, user: userId });

  if (!order) throw new AppError(status.NOT_FOUND, 'Order not found');

  const amountInCents = Math.round(order.finalAmount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: (order.currency || 'usd').toLowerCase(),
    metadata: { orderId: order._id.toString() },
  });

  return { clientSecret: paymentIntent.client_secret };
};

const confirmPayment = async (invoiceId: string, transactionId: string, gatewayResponse?: any) => {
  return withTransaction(async (session) => {
    const order = await Order.findOne({ invoiceId: invoiceId });
    if (!order) throw new AppError(status.NOT_FOUND, 'Order not found');

    if (order.payment.status === 'paid') {
      await session.commitTransaction();
      await session.endSession();
      return order;
    }

    order.payment = order.payment || ({} as any);
    order.payment.status = 'paid';
    order.payment.transactionId = transactionId;
    order.payment.gatewayResponse = gatewayResponse;

    const prev = order.status;
    order.status = 'paid';
    order.orderLogs = order.orderLogs || [];
    order.orderLogs.push({
      at: new Date(),
      by: undefined,
      fromStatus: prev,
      toStatus: 'paid',
      note: 'Payment confirmed',
    });

    await order.save({ session });

    return order;
  });
};

const shipOrder = async (orderId: string, shipmentId?: string, bySellerId?: string) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError(status.NOT_FOUND, 'Order not found.');

  if (order.status === 'shipped' || order.status === 'delivered') return order;

  const prev = order.status;
  order.status = 'shipped';
  (order as any).shipmentId = shipmentId;
  order.orderLogs = order.orderLogs || [];
  order.orderLogs.push({
    at: new Date(),
    by: bySellerId as any,
    fromStatus: prev,
    toStatus: 'shipped',
    note: 'Order shipped',
  });

  await order.save();
  return order;
};

const deliverOrder = async (orderId: string) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError(status.NOT_FOUND, 'Order not found.');
  if (order.status === 'delivered') return order;

  const prev = order.status;
  order.status = 'delivered';
  order.orderLogs = order.orderLogs || [];
  order.orderLogs.push({
    at: new Date(),
    fromStatus: prev,
    toStatus: 'delivered',
    note: 'Order delivered',
  });

  await order.save();
  return order;
};

const cancelOrder = async (invoiceId: string, byUserId?: string) => {
  return withTransaction(async (session) => {
    const order = await Order.findOne({ invoiceId: invoiceId, user: byUserId }).session(session);
    if (!order) throw new AppError(status.NOT_FOUND, 'Order not found.');
    if (['delivered', 'refunded'].includes(order.status))
      throw new AppError(status.BAD_REQUEST, 'Cannot cancel delivered/refunded order.');

    const prev = order.status;
    order.status = 'cancelled';
    order.orderLogs = order.orderLogs || [];
    order.orderLogs.push({
      at: new Date(),
      by: byUserId as any,
      fromStatus: prev,
      toStatus: 'cancelled',
      note: 'Order cancelled',
    });

    // if paid: schedule refund
    if (order.payment?.status === 'paid') {
      order.payment.status = 'refunded';
    }

    await order.save({ session });

    return order;
  });
};

const refoundOrder = async (orderId: string) => {
  return withTransaction(async (session) => {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new AppError(status.NOT_FOUND, 'Order not found.');
    if (order.payment?.status !== 'paid') throw new AppError(status.BAD_REQUEST, 'Order not paid.');

    order.payment.status = 'refunded';
    order.orderLogs = order.orderLogs || [];
    order.orderLogs.push({ at: new Date(), toStatus: 'refunded', note: 'Refund processed' });

    // optionally restore stock if business rules require
    await Product.updateOne({ _id: order.product }, { $inc: { stock: order.quantity } }).session(
      session,
    );

    await order.save({ session });
    return order;
  });
};

export const OrderService = {
  createOrderIntoDB,
  createStripePayment,
  confirmPayment,
  shipOrder,
  deliverOrder,
  cancelOrder,
  refoundOrder,
};
