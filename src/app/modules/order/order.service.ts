/* eslint-disable @typescript-eslint/no-explicit-any */
import { Product } from '@modules/products/products.model.js';
import status from 'http-status';
import mongoose from 'mongoose';

import { ErrorMessages } from '@constants/errorMessages.js';

import AppError from '@errors/appError.js';

import type { TOrder, TPayload } from './order.interface.js';
import { Order } from './order.model.js';
import {
  pushToQueue,
  safeCommitReserved,
  safeIncReserved,
  safeReleaseReserved,
} from './order.utils.js';

const createOrderIntoDB = async (userId: string, payload: TPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(payload.product).session(session);
    if (!product) throw new AppError(status.NOT_FOUND, ErrorMessages.PRODUCT.NOT_FOUND);

    if (product.stock < payload.quantity) {
      throw new AppError(status.BAD_REQUEST, ErrorMessages.PRODUCT.QUANTITY_EXCEEDS(product.stock));
    }

    const reserveNow = payload.reserve ?? true;
    if (reserveNow) {
      const ok = await safeIncReserved(product._id as any, payload.quantity, session);
      if (!ok) throw new AppError(status.BAD_REQUEST, `Insufficient stock (${product.stock})`);
    } else {
      const res = await Product.updateOne(
        { _id: product._id, stock: { $gte: payload.quantity } },
        { $inc: { stock: -payload.quantity } },
      ).session(session);
      if (res.modifiedCount !== 1)
        throw new AppError(status.BAD_REQUEST, `Insufficient stock (${product.stock})`);
    }

    const priceAtAddTime = product.price;
    const perItemDiscount = product.discountPrice || 0;
    const totalAmount = priceAtAddTime * payload.quantity;
    const totalDiscount = perItemDiscount * payload.quantity;
    const finalAmount = Math.max(0, totalAmount - totalDiscount);

    const orderData: Partial<TOrder> = {
      user: userId as any,
      product: product._id as any,
      quantity: payload.quantity,
      priceAtAddTime,
      totalAmount,
      discountAmount: perItemDiscount,
      totalDiscount,
      finalAmount,
      currency: payload.currency || 'BDT',
      status: 'pending',
      payment: { method: payload.payment.method as any, status: 'pending' },
      shippingAddress: payload.shippingAddress,
      reserved: reserveNow,
      orderLogs: [
        {
          at: new Date(),
          by: payload.userId as string,
          toStatus: 'pending',
          note: 'Order created (reserved)',
        },
      ],
    };

    const [orderDoc] = await Order.create([orderData], { session });

    await pushToQueue('order.created', { orderId: orderDoc._id.toString() });

    await session.commitTransaction();
    await session.endSession();

    return orderDoc;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const confirmPayment = async (orderId: string, transactionId: string, gatewayResponse?: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId);
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

    if (order.reserved) {
      await safeCommitReserved(order.product as any, order.quantity, session);
      order.reserved = false;
    }

    await order.save({ session });

    await pushToQueue('order.paid', { orderId: order._id.toString() });

    await session.commitTransaction();
    await session.endSession();
    return order;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
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
  await pushToQueue('order.shipped', { orderId: order._id.toString(), shipmentId });
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
  await pushToQueue('order.delivered', { orderId: order._id.toString() });
  return order;
};

const cancelOrder = async (orderId: string, byUserId?: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new AppError(status.NOT_FOUND, 'Order not found.');
    if (['delivered', 'refunded'].includes(order.status))
      throw new AppError(status.BAD_REQUEST, 'Cannot cancel delivered/refunded order.');

    // release reservation or restore stock
    if (order.reserved) {
      await safeReleaseReserved(order.product as any, order.quantity, session);
    } else {
      await Product.updateOne({ _id: order.product }, { $inc: { stock: order.quantity } }).session(
        session,
      );
    }

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
      await pushToQueue('order.refund.requested', { orderId: order._id.toString() });
    }

    await order.save({ session });
    await pushToQueue('order.cancelled', { orderId: order._id.toString() });

    await session.commitTransaction();
    session.endSession();
    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const refoundOrder = async (orderId: string, reason?: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new AppError(status.NOT_FOUND, 'Order not found.');
    if (order.payment?.status !== 'paid') throw new AppError(status.BAD_REQUEST, 'Order not paid.');

    // integrate with gateway SDK here; simulate success:
    const gatewayResponse = { refunded: true, refundedAt: new Date(), reason };

    order.payment.status = 'refunded';
    order.orderLogs = order.orderLogs || [];
    order.orderLogs.push({ at: new Date(), toStatus: 'refunded', note: 'Refund processed' });

    // optionally restore stock if business rules require
    await Product.updateOne({ _id: order.product }, { $inc: { stock: order.quantity } }).session(
      session,
    );

    await order.save({ session });
    await pushToQueue('order.refunded', { orderId: order._id.toString(), gatewayResponse });

    await session.commitTransaction();
    session.endSession();
    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const OrderService = {
  createOrderIntoDB,
  confirmPayment,
  shipOrder,
  deliverOrder,
  cancelOrder,
  refoundOrder,
};
