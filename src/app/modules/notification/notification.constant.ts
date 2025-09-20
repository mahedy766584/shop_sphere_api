import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

import config from '@config/index.js';

export const NotificationType = ['order', 'promotion', 'system', 'message', 'shipment'] as const;

export const NotificationChannel = ['in_app', 'push', 'email', 'sms'] as const;

export const NotificationPriority = ['low', 'normal', 'high'] as const;

// Deduplication time window: 5 minutes
export const DEDUPE_WINDOW_MS = 5 * 60 * 1000;

export const connection = new Redis(config.redis_url as string);
export const sendQueue = new Queue('notification-send', { connection });
