/* eslint-disable no-undef */
/* eslint-disable no-console */
import { Redis } from 'ioredis';

import config from '@config/index.js';

export const redisClient = new Redis((config.redis_url as string) || 'redis://127.0.0.1:6379');

redisClient.on('connect', () => console.log('✅ Redis connected'));

redisClient.on('error', (err) => console.error('❌ Redis error:', err));
