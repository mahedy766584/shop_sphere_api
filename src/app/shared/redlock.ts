/* eslint-disable no-undef */
import Redlock from 'redlock';

import { redisClient } from './redisClient.js';

// ✅ Redlock instance
export const redlock = new Redlock([redisClient], {
  driftFactor: 0.01, // Clock drift handle
  retryCount: 5, // কতবার retry করবে lock পেতে
  retryDelay: 200, // প্রতি retry এর delay (ms)
  retryJitter: 200, // random delay avoid করতে
});

// Error listener
redlock.on('error', (err) => {
  console.error('❌ Redlock error', err);
});
