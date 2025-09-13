/* eslint-disable @typescript-eslint/no-explicit-any */

import { Product } from '@modules/products/products.model.js';
import type { Types } from 'mongoose';
import type mongoose from 'mongoose';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const pushToQueue = async (name: string, payload: any) => {
  // queue.add(name, payload);
  return;
};

export const safeIncReserved = async (
  productId: Types.ObjectId,
  qty: number,
  session?: mongoose.ClientSession,
) => {
  const result = await Product.updateOne(
    { _id: productId, stock: { $gte: qty } },
    { $inc: { stock: -qty, reserved: qty } },
  ).session(session ?? null);

  return result.modifiedCount === 1;
};

export const safeReleaseReserved = async (
  productId: Types.ObjectId,
  qty: number,
  session?: mongoose.ClientSession,
) => {
  await Product.updateOne({ _id: productId }, { $inc: { reserved: -qty, stock: qty } }).session(
    session ?? null,
  );
};

export const safeCommitReserved = async (
  productId: Types.ObjectId,
  qty: number,
  session?: mongoose.ClientSession,
) => {
  // commit reservation: reserved -= qty (stock was already reduced at reservation)
  await Product.updateOne({ _id: productId }, { $inc: { reserved: -qty } }).session(
    session ?? null,
  );
};
