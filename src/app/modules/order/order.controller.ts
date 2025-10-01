import status from 'http-status';

import catchAsync from '@utils/async/catchAsync.js';
import sendResponse from '@utils/common/sendResponse.js';

import { OrderService } from './order.service.js';

const createOrderIntoDB = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const order = await OrderService.createOrderIntoDB(userId, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
});

const createStripePayment = catchAsync(async (req, res) => {
  const { invoiceId } = req.body;
  const { userId } = req.user;
  const result = await OrderService.createStripePayment(invoiceId, userId);
  sendResponse(res, {
    statusCode: status.OK || 200,
    success: true,
    message: 'Stripe PaymentIntent created successfully',
    data: result,
  });
});

const confirmPayment = catchAsync(async (req, res) => {
  const { orderId, transactionId, status, gatewayResponse } = req.body;
  if (status === 'success') {
    const order = await OrderService.confirmPayment(orderId, transactionId, gatewayResponse);
    sendResponse(res, {
      statusCode: status.OK || 200,
      success: true,
      message: 'Payment confirmed',
      data: order,
    });
  } else {
    await OrderService.cancelOrder(orderId);
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Payment failed and order cancelled',
      data: {},
    });
  }
});

const shipOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { shipmentId } = req.body;
  const order = await OrderService.shipOrder(orderId, shipmentId, req.user.userId);
  return sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Order shipped',
    data: order,
  });
});

const deliverOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const order = await OrderService.deliverOrder(orderId);
  return sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Order delivered',
    data: order,
  });
});

const cancelOrder = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;
  const order = await OrderService.cancelOrder(invoiceId, req.user.userId);
  return sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Order cancelled',
    data: order,
  });
});

export const OrderController = {
  createOrderIntoDB,
  createStripePayment,
  confirmPayment,
  shipOrder,
  deliverOrder,
  cancelOrder,
};
